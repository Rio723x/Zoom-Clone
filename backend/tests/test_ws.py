from contextlib import contextmanager

import pytest
from starlette.websockets import WebSocketDisconnect


def _new_meeting(client):
    body = client.post("/api/meetings/instant").json()
    return body["id"], body["host_token"]


def _join(client, meeting_id, name, host_token=None):
    payload = {"display_name": name}
    if host_token:
        payload["host_token"] = host_token
    return client.post(f"/api/meetings/{meeting_id}/join", json=payload).json()


@contextmanager
def _socket(client, meeting_id, joined):
    url = f"/api/ws/{meeting_id}?participant_id={joined['participant_id']}&key={joined['session_key']}"
    with client.websocket_connect(url) as ws:
        yield ws


def _claim(client, meeting_id, joined):
    return client.post(
        f"/api/meetings/{meeting_id}/participants/{joined['participant_id']}/token",
        json={"session_key": joined["session_key"]},
    )


def test_socket_rejects_bad_key(client):
    meeting_id, _ = _new_meeting(client)
    joined = _join(client, meeting_id, "Sam")
    with pytest.raises(WebSocketDisconnect) as exc:
        with _socket(client, meeting_id, {**joined, "session_key": "wrong"}):
            pass
    assert exc.value.code == 4403


def test_presence_and_chat_are_broadcast_and_persisted(client):
    meeting_id, host_token = _new_meeting(client)
    host = _join(client, meeting_id, "Alex", host_token)
    guest = _join(client, meeting_id, "Sam")

    with _socket(client, meeting_id, host) as h:
        state = h.receive_json()
        assert state["type"] == "state"
        assert state["you"]["role"] == "host"

        with _socket(client, meeting_id, guest) as g:
            assert g.receive_json()["type"] == "state"
            joined = h.receive_json()
            assert joined["type"] == "participant-joined"
            assert joined["participant"]["name"] == "Sam"

            g.send_json({"type": "chat", "text": "hello all"})
            for ws in (h, g):
                msg = ws.receive_json()["message"]
                assert msg["text"] == "hello all"
                assert msg["sender_name"] == "Sam"
                assert msg["participant_id"] == guest["participant_id"]

        assert h.receive_json() == {"type": "participant-left", "participant_id": guest["participant_id"]}

    # A later joiner gets the history in their initial state.
    late = _join(client, meeting_id, "Late")
    with _socket(client, meeting_id, late) as ws:
        assert [m["text"] for m in ws.receive_json()["messages"]] == ["hello all"]


def test_guests_cannot_use_host_only_events(client):
    meeting_id, _ = _new_meeting(client)
    guest = _join(client, meeting_id, "Sam")
    with _socket(client, meeting_id, guest) as g:
        g.receive_json()
        for event in (
            {"type": "set-controls", "locked": True},
            {"type": "mute", "target": "all"},
            {"type": "end-meeting"},
            {"type": "remove", "participant_id": 1},
            {"type": "poll-create", "question": "Q?", "options": ["a", "b"]},
        ):
            g.send_json(event)
            assert g.receive_json() == {"type": "error", "code": "forbidden"}
    assert client.get(f"/api/meetings/{meeting_id}").json()["status"] == "live"


def test_invalid_messages_get_an_error(client):
    meeting_id, _ = _new_meeting(client)
    guest = _join(client, meeting_id, "Sam")
    with _socket(client, meeting_id, guest) as g:
        g.receive_json()
        g.send_json({"type": "nonsense"})
        assert g.receive_json()["code"] == "invalid-message"
        g.send_json({"type": "chat", "text": ""})
        assert g.receive_json()["code"] == "invalid-message"
        g.send_text("not json")
        assert g.receive_json()["code"] == "invalid-message"


def test_waiting_room_withholds_token_until_host_admits(client):
    meeting_id, host_token = _new_meeting(client)
    host = _join(client, meeting_id, "Alex", host_token)

    with _socket(client, meeting_id, host) as h:
        h.receive_json()
        h.send_json({"type": "set-controls", "waiting_room": True})
        assert h.receive_json()["controls"]["waiting_room"] is True

        guest = _join(client, meeting_id, "Sam")
        assert guest["admitted"] is False
        assert guest["token"] is None
        assert _claim(client, meeting_id, guest).status_code == 403

        with _socket(client, meeting_id, guest) as g:
            assert g.receive_json() == {"type": "waiting"}
            waiting = h.receive_json()
            assert waiting["type"] == "waiting-joined"
            assert waiting["participant"]["name"] == "Sam"

            # Waiting participants get no room traffic and can't act.
            h.send_json({"type": "chat", "text": "secret"})
            h.receive_json()
            g.send_json({"type": "chat", "text": "let me in"})
            assert g.receive_json() == {"type": "error", "code": "not-admitted"}

            h.send_json({"type": "admit", "participant_id": guest["participant_id"]})
            assert g.receive_json() == {"type": "admitted"}
            assert g.receive_json()["type"] == "state"
            assert h.receive_json()["type"] == "participant-joined"
            assert h.receive_json()["type"] == "waiting-left"

            claimed = _claim(client, meeting_id, guest)
            assert claimed.status_code == 200
            assert claimed.json()["room_id"] == f"room-{meeting_id}"


def test_denied_guest_is_disconnected_and_cannot_claim_token(client):
    meeting_id, host_token = _new_meeting(client)
    host = _join(client, meeting_id, "Alex", host_token)
    with _socket(client, meeting_id, host) as h:
        h.receive_json()
        h.send_json({"type": "set-controls", "waiting_room": True})
        h.receive_json()
        guest = _join(client, meeting_id, "Sam")

        with _socket(client, meeting_id, guest) as g:
            g.receive_json()
            h.receive_json()  # waiting-joined
            h.send_json({"type": "deny", "participant_id": guest["participant_id"]})
            assert g.receive_json() == {"type": "denied"}
            assert h.receive_json()["type"] == "waiting-left"

        assert _claim(client, meeting_id, guest).status_code == 403


def test_host_can_remove_participant_but_not_the_host(client):
    meeting_id, host_token = _new_meeting(client)
    host = _join(client, meeting_id, "Alex", host_token)
    guest = _join(client, meeting_id, "Sam")

    with _socket(client, meeting_id, host) as h:
        h.receive_json()
        with _socket(client, meeting_id, guest) as g:
            g.receive_json()
            h.receive_json()  # participant-joined

            h.send_json({"type": "remove", "participant_id": host["participant_id"]})
            assert h.receive_json() == {"type": "error", "code": "participant-not-found"}

            h.send_json({"type": "remove", "participant_id": guest["participant_id"]})
            assert g.receive_json() == {"type": "removed"}
            assert h.receive_json() == {"type": "participant-left", "participant_id": guest["participant_id"]}

    assert _claim(client, meeting_id, guest).status_code == 403
    with pytest.raises(WebSocketDisconnect):
        with _socket(client, meeting_id, guest):
            pass


def test_mute_all_reaches_guests_only(client):
    meeting_id, host_token = _new_meeting(client)
    host = _join(client, meeting_id, "Alex", host_token)
    guest = _join(client, meeting_id, "Sam")

    with _socket(client, meeting_id, host) as h:
        h.receive_json()
        with _socket(client, meeting_id, guest) as g:
            g.receive_json()
            h.receive_json()
            h.send_json({"type": "mute", "target": "all"})
            assert g.receive_json() == {"type": "mute", "by": host["participant_id"]}
            # The host wasn't muted: the next thing the host sees is its own later event.
            h.send_json({"type": "raise-hand", "raised": True})
            assert h.receive_json()["type"] == "hand"


def test_chat_can_be_disabled_for_guests_but_not_host(client):
    meeting_id, host_token = _new_meeting(client)
    host = _join(client, meeting_id, "Alex", host_token)
    guest = _join(client, meeting_id, "Sam")

    with _socket(client, meeting_id, host) as h:
        h.receive_json()
        with _socket(client, meeting_id, guest) as g:
            g.receive_json()
            h.receive_json()
            h.send_json({"type": "set-controls", "allow_chat": False})
            assert h.receive_json()["controls"]["allow_chat"] is False
            assert g.receive_json()["controls"]["allow_chat"] is False

            g.send_json({"type": "chat", "text": "hi"})
            assert g.receive_json() == {"type": "error", "code": "chat-disabled"}

            h.send_json({"type": "chat", "text": "announcement"})
            assert g.receive_json()["message"]["text"] == "announcement"


def test_polls_vote_change_close_and_history(client):
    meeting_id, host_token = _new_meeting(client)
    host = _join(client, meeting_id, "Alex", host_token)
    guest = _join(client, meeting_id, "Sam")

    with _socket(client, meeting_id, host) as h:
        h.receive_json()
        with _socket(client, meeting_id, guest) as g:
            g.receive_json()
            h.receive_json()

            h.send_json({"type": "poll-create", "question": "Lunch?", "options": ["Pizza", "Sushi"]})
            poll = h.receive_json()["poll"]
            assert g.receive_json()["poll"]["id"] == poll["id"]
            pizza, sushi = (o["id"] for o in poll["options"])

            g.send_json({"type": "poll-vote", "poll_id": poll["id"], "option_id": pizza})
            counts = lambda ev: {o["text"]: o["vote_count"] for o in ev["poll"]["options"]}
            assert counts(h.receive_json()) == {"Pizza": 1, "Sushi": 0}
            assert counts(g.receive_json()) == {"Pizza": 1, "Sushi": 0}
            assert g.receive_json()["type"] == "vote-recorded"

            # Changing a vote moves it rather than adding a second one.
            g.send_json({"type": "poll-vote", "poll_id": poll["id"], "option_id": sushi})
            assert counts(h.receive_json()) == {"Pizza": 0, "Sushi": 1}
            g.receive_json()
            g.receive_json()

            h.send_json({"type": "poll-close", "poll_id": poll["id"]})
            assert h.receive_json()["poll"]["is_open"] is False
            g.receive_json()

            g.send_json({"type": "poll-vote", "poll_id": poll["id"], "option_id": pizza})
            assert g.receive_json() == {"type": "error", "code": "vote-rejected"}

    # Reconnecting restores the poll, results and the guest's own vote.
    with _socket(client, meeting_id, guest) as g:
        state = g.receive_json()
        assert state["polls"][0]["question"] == "Lunch?"
        assert state["my_votes"] == {str(poll["id"]): sushi}


def test_ending_meeting_notifies_everyone_and_blocks_new_joins(client):
    meeting_id, host_token = _new_meeting(client)
    host = _join(client, meeting_id, "Alex", host_token)
    guest = _join(client, meeting_id, "Sam")

    with _socket(client, meeting_id, host) as h:
        h.receive_json()
        with _socket(client, meeting_id, guest) as g:
            g.receive_json()
            h.receive_json()
            h.send_json({"type": "end-meeting"})
            assert g.receive_json() == {"type": "meeting-ended"}
            assert h.receive_json() == {"type": "meeting-ended"}

    assert client.get(f"/api/meetings/{meeting_id}").json()["status"] == "ended"
    assert client.post(f"/api/meetings/{meeting_id}/join", json={"display_name": "Late"}).status_code == 410


def test_ending_via_rest_also_closes_sockets(client):
    meeting_id, host_token = _new_meeting(client)
    host = _join(client, meeting_id, "Alex", host_token)
    with _socket(client, meeting_id, host) as h:
        h.receive_json()
        client.post(f"/api/meetings/{meeting_id}/end", json={}, headers={"X-Host-Token": host_token})
        assert h.receive_json() == {"type": "meeting-ended"}
