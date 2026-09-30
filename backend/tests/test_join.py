import jwt

from tests.conftest import SECRET


def _instant(client):
    body = client.post("/api/meetings/instant").json()
    return body["id"], body["host_token"]


def _join(client, meeting_id, name="Sam", host_token=None):
    payload = {"display_name": name}
    if host_token:
        payload["host_token"] = host_token
    return client.post(f"/api/meetings/{meeting_id}/join", json=payload)


def _decode(token):
    return jwt.decode(token, SECRET, algorithms=["HS256"])


def test_host_join_gets_moderator_token(client):
    meeting_id, host_token = _instant(client)

    res = _join(client, meeting_id, "Alex", host_token)

    assert res.status_code == 200
    body = res.json()
    assert body["role"] == "host"
    assert body["admitted"] is True
    assert body["session_key"]
    assert body["room_id"] == f"room-{meeting_id}"
    claims = _decode(body["token"])
    assert "allow_mod" in claims["permissions"]
    assert claims["roomId"] == body["room_id"]
    assert claims["participantId"] == str(body["participant_id"])
    assert claims["apikey"] == "test-key"


def test_guest_join_gets_no_moderator_permission(client):
    meeting_id, _ = _instant(client)

    body = _join(client, meeting_id, "  Sam  ").json()

    assert body["role"] == "participant"
    assert _decode(body["token"])["permissions"] == ["allow_join"]


def test_wrong_host_token_is_rejected(client):
    meeting_id, _ = _instant(client)
    assert _join(client, meeting_id, "Eve", "nope").status_code == 403


def test_join_unknown_meeting_is_404(client):
    assert _join(client, "nope").status_code == 404


def test_join_requires_display_name(client):
    meeting_id, _ = _instant(client)
    assert _join(client, meeting_id, "   ").status_code == 422


def test_join_ended_meeting_is_gone(client):
    meeting_id, host_token = _instant(client)
    client.post(f"/api/meetings/{meeting_id}/end", json={}, headers={"X-Host-Token": host_token})
    assert _join(client, meeting_id).status_code == 410


def test_joining_scheduled_meeting_makes_it_live_and_drops_from_upcoming(client):
    created = client.post(
        "/api/meetings/schedule", json={"title": "Sync", "scheduled_at": "2999-01-01T10:00:00Z"}
    ).json()
    assert len(client.get("/api/meetings/upcoming").json()) == 1

    _join(client, created["id"], "Alex", created["host_token"])

    assert client.get(f"/api/meetings/{created['id']}").json()["status"] == "live"
    assert client.get("/api/meetings/upcoming").json() == []


def test_leave_requires_the_participants_session_key(client):
    meeting_id, _ = _instant(client)
    joined = _join(client, meeting_id).json()
    url = f"/api/meetings/{meeting_id}/leave"

    bad = client.post(url, json={"participant_id": joined["participant_id"], "session_key": "wrong"})
    assert bad.status_code == 403

    ok = client.post(url, json={"participant_id": joined["participant_id"], "session_key": joined["session_key"]})
    assert ok.status_code == 200


def test_video_service_failure_surfaces_as_502(client, monkeypatch):
    from app.services import videosdk_service

    def boom(_):
        raise videosdk_service.VideoSDKError("down")

    monkeypatch.setattr(videosdk_service, "create_room", boom)
    meeting_id, _ = _instant(client)
    assert _join(client, meeting_id).status_code == 502


def test_locked_meeting_rejects_guests_but_not_the_host(client):
    meeting_id, host_token = _instant(client)
    host = _join(client, meeting_id, "Alex", host_token).json()
    with client.websocket_connect(f"/api/ws/{meeting_id}?participant_id={host['participant_id']}&key={host['session_key']}") as ws:
        ws.receive_json()  # state
        ws.send_json({"type": "set-controls", "locked": True})
        assert ws.receive_json()["controls"]["locked"] is True

    assert _join(client, meeting_id, "Late").status_code == 403
    assert _join(client, meeting_id, "Alex again", host_token).status_code == 200
