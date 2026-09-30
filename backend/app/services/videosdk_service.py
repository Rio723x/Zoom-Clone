import time

import httpx
import jwt

from app.core.config import settings

VIDEOSDK_API_URL = "https://api.videosdk.live/v2"
TOKEN_TTL_SECONDS = 2 * 60 * 60
REQUEST_TIMEOUT_SECONDS = 10


class VideoSDKError(Exception):
    """VideoSDK is unconfigured or rejected/failed a request."""


def _require_credentials() -> None:
    if not settings.videosdk_api_key or not settings.videosdk_secret:
        raise VideoSDKError("VideoSDK credentials are not configured")


def generate_token(*, is_host: bool, room_id: str | None = None, participant_id: str | None = None) -> str:
    """Signed JWT the browser uses to join a room. The secret never leaves the server."""
    _require_credentials()
    now = int(time.time())
    permissions = ["allow_join", "allow_mod"] if is_host else ["allow_join"]
    payload: dict = {
        "apikey": settings.videosdk_api_key,
        "permissions": permissions,
        "version": 2,
        "iat": now,
        "exp": now + TOKEN_TTL_SECONDS,
    }
    if room_id:
        payload["roomId"] = room_id
    if participant_id:
        # Pins the token to one media identity, which we keep equal to our participant id.
        payload["participantId"] = participant_id
    return jwt.encode(payload, settings.videosdk_secret, algorithm="HS256")


def create_room(custom_room_id: str) -> str:
    """Create a VideoSDK room keyed by our meeting id and return its room id."""
    token = generate_token(is_host=True)
    try:
        response = httpx.post(
            f"{VIDEOSDK_API_URL}/rooms",
            headers={"Authorization": token},
            json={"customRoomId": custom_room_id},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise VideoSDKError(f"Could not create VideoSDK room: {exc}") from exc
    return response.json()["roomId"]
