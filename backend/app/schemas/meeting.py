from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.meeting import MeetingStatus
from app.schemas.utc import UTCDatetime


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    scheduled_at: datetime
    duration: int | None = Field(default=None, ge=1, le=1440)  # minutes


class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str | None = None
    scheduled_at: UTCDatetime | None = None
    duration: int | None = None
    is_instant: bool
    status: MeetingStatus
    host_name: str
    created_at: UTCDatetime


class MeetingCreatedResponse(MeetingResponse):
    """Returned only to the creator; carries the secret that proves host identity."""

    host_token: str


class MeetingControls(BaseModel):
    """Host-managed meeting state that every client mirrors."""

    model_config = ConfigDict(from_attributes=True)

    locked: bool
    waiting_room: bool
    allow_share: bool
    allow_chat: bool
    allow_unmute: bool


class MeetingControlsUpdate(BaseModel):
    locked: bool | None = None
    waiting_room: bool | None = None
    allow_share: bool | None = None
    allow_chat: bool | None = None
    allow_unmute: bool | None = None


class RecentMeetingResponse(BaseModel):
    id: str
    meeting_id: str
    title: str
    host_name: str | None = None
    ended_at: UTCDatetime
    duration_minutes: int | None = None


class EndMeetingRequest(BaseModel):
    duration_minutes: int | None = Field(default=None, ge=0)
