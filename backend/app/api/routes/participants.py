from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.participant import (
    ClaimTokenRequest,
    ClaimTokenResponse,
    JoinRequest,
    JoinResponse,
    LeaveRequest,
)
from app.services import participant_service

router = APIRouter(prefix="/meetings", tags=["participants"])


@router.post("/{meeting_id}/join", response_model=JoinResponse)
def join_meeting(meeting_id: str, body: JoinRequest, db: Session = Depends(get_db)):
    meeting, participant, token = participant_service.join_meeting(
        db, meeting_id, body.display_name, body.host_token
    )
    return JoinResponse(
        participant_id=participant.id,
        session_key=participant.session_key,
        role=participant.role,
        admitted=participant.admitted,
        token=token,
        room_id=meeting.videosdk_room_id,
        meeting=meeting,
    )


@router.post("/{meeting_id}/participants/{participant_id}/token", response_model=ClaimTokenResponse)
def claim_token(
    meeting_id: str, participant_id: int, body: ClaimTokenRequest, db: Session = Depends(get_db)
):
    """Called once the host admits a waiting participant."""
    meeting, token = participant_service.claim_token(db, meeting_id, participant_id, body.session_key)
    return ClaimTokenResponse(token=token, room_id=meeting.videosdk_room_id)


@router.post("/{meeting_id}/leave")
def leave_meeting(meeting_id: str, body: LeaveRequest, db: Session = Depends(get_db)):
    participant_service.leave_meeting(db, meeting_id, body.participant_id, body.session_key)
    return {"ok": True}
