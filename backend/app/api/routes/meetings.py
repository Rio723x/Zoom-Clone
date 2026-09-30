from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_host
from app.core.database import get_db
from app.schemas import (
    EndMeetingRequest,
    MeetingCreate,
    MeetingCreatedResponse,
    MeetingResponse,
    RecentMeetingResponse,
)
from app.services import meeting_service
from app.ws.manager import room_manager

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.post("/instant", response_model=MeetingCreatedResponse)
def create_instant_meeting(db: Session = Depends(get_db)):
    return meeting_service.create_instant_meeting(db)


@router.post("/schedule", response_model=MeetingCreatedResponse)
def schedule_meeting(data: MeetingCreate, db: Session = Depends(get_db)):
    return meeting_service.schedule_meeting(db, data)


# Fixed paths must be declared before "/{meeting_id}" so they aren't captured by it.
@router.get("/upcoming", response_model=list[MeetingResponse])
def get_upcoming_meetings(db: Session = Depends(get_db)):
    return meeting_service.list_upcoming(db)


@router.get("/recent", response_model=list[RecentMeetingResponse])
def get_recent_meetings(db: Session = Depends(get_db)):
    return meeting_service.list_recent(db)


@router.get("", response_model=list[MeetingResponse])
def get_all_meetings(db: Session = Depends(get_db)):
    return meeting_service.list_meetings(db)


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    return meeting_service.get_meeting(db, meeting_id)


@router.post("/{meeting_id}/end", dependencies=[Depends(require_host)])
async def end_meeting(meeting_id: str, body: EndMeetingRequest, db: Session = Depends(get_db)):
    meeting_service.end_meeting(db, meeting_id, body.duration_minutes)
    await room_manager.close_room(meeting_id, {"type": "meeting-ended"})
    return {"ok": True}


@router.delete("/{meeting_id}", dependencies=[Depends(require_host)])
async def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting_service.delete_meeting(db, meeting_id)
    await room_manager.close_room(meeting_id, {"type": "meeting-ended"})
    return {"ok": True}
