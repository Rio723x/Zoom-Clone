from pydantic import BaseModel, Field, field_validator

from app.models.participant import ParticipantRole
from app.schemas.meeting import MeetingResponse


class JoinRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)
    # Present only when the caller created the meeting; proves host identity.
    host_token: str | None = None

    @field_validator("display_name")
    @classmethod
    def _strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("display_name must not be blank")
        return value


class JoinResponse(BaseModel):
    participant_id: int
    # Secret for this participant: authenticates the WebSocket and token claims.
    session_key: str
    role: ParticipantRole
    # False while the host has this participant in the waiting room; no token until admitted.
    admitted: bool
    token: str | None = None
    room_id: str | None = None
    meeting: MeetingResponse


class ClaimTokenRequest(BaseModel):
    session_key: str


class ClaimTokenResponse(BaseModel):
    token: str
    room_id: str


class LeaveRequest(BaseModel):
    participant_id: int
    session_key: str
