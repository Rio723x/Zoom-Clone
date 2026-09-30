from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration: Optional[int] = None
    is_instant: bool = False


class MeetingCreate(MeetingBase):
    pass


class MeetingResponse(MeetingBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RecentMeetingResponse(BaseModel):
    id: str
    meeting_id: str
    title: str
    host_name: Optional[str] = None
    ended_at: datetime
    duration_minutes: Optional[int] = None

    model_config = {"from_attributes": True}


class EndMeetingRequest(BaseModel):
    host_name: Optional[str] = "Host"
    duration_minutes: Optional[int] = None
