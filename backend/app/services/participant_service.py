import secrets

from sqlalchemy.orm import Session

from app.core.clock import utcnow
from app.core.exceptions import (
    InvalidHostTokenError,
    InvalidSessionError,
    MeetingEndedError,
    MeetingLockedError,
    NotAdmittedError,
    ParticipantRemovedError,
)
from app.models import Meeting, MeetingStatus, Participant, ParticipantRole
from app.services import meeting_service, videosdk_service


def _resolve_role(meeting: Meeting, host_token: str | None) -> ParticipantRole:
    if host_token is None:
        return ParticipantRole.PARTICIPANT
    if not secrets.compare_digest(host_token, meeting.host_token):
        raise InvalidHostTokenError()
    return ParticipantRole.HOST


def _token_for(meeting: Meeting, participant: Participant) -> str:
    return videosdk_service.generate_token(
        is_host=participant.role == ParticipantRole.HOST,
        room_id=meeting.videosdk_room_id,
        participant_id=str(participant.id),
    )


def join_meeting(
    db: Session, meeting_id: str, display_name: str, host_token: str | None
) -> tuple[Meeting, Participant, str | None]:
    """Register a participant. The media token is withheld while they sit in the waiting room."""
    meeting = meeting_service.get_meeting(db, meeting_id)
    if meeting.status == MeetingStatus.ENDED:
        raise MeetingEndedError()

    role = _resolve_role(meeting, host_token)
    is_host = role == ParticipantRole.HOST
    if meeting.locked and not is_host:
        raise MeetingLockedError()

    # Room creation is idempotent per custom id, so concurrent first joins are safe.
    if meeting.videosdk_room_id is None:
        meeting.videosdk_room_id = videosdk_service.create_room(meeting.id)

    admitted = is_host or not meeting.waiting_room
    if admitted and meeting.status == MeetingStatus.SCHEDULED:
        meeting.status = MeetingStatus.LIVE
        meeting.started_at = utcnow()

    participant = Participant(
        meeting_id=meeting.id, display_name=display_name, role=role, admitted=admitted
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)

    return meeting, participant, _token_for(meeting, participant) if admitted else None


def authenticate(db: Session, meeting_id: str, participant_id: int, session_key: str) -> Participant:
    participant = db.get(Participant, participant_id)
    if (
        participant is None
        or participant.meeting_id != meeting_id
        or not secrets.compare_digest(session_key, participant.session_key)
    ):
        raise InvalidSessionError()
    return participant


def claim_token(
    db: Session, meeting_id: str, participant_id: int, session_key: str
) -> tuple[Meeting, str]:
    """Media token for a participant the host has admitted."""
    participant = authenticate(db, meeting_id, participant_id, session_key)
    meeting = meeting_service.get_meeting(db, meeting_id)
    if meeting.status == MeetingStatus.ENDED:
        raise MeetingEndedError()
    if participant.left_at is not None:
        raise ParticipantRemovedError()
    if not participant.admitted:
        raise NotAdmittedError()
    return meeting, _token_for(meeting, participant)


def leave_meeting(db: Session, meeting_id: str, participant_id: int, session_key: str) -> None:
    participant = authenticate(db, meeting_id, participant_id, session_key)
    if participant.left_at is None:
        participant.left_at = utcnow()
        db.commit()


def _get_in_meeting(db: Session, meeting_id: str, participant_id: int) -> Participant | None:
    participant = db.get(Participant, participant_id)
    if participant is None or participant.meeting_id != meeting_id:
        return None
    return participant


def admit(db: Session, meeting_id: str, participant_id: int) -> Participant | None:
    participant = _get_in_meeting(db, meeting_id, participant_id)
    if participant is None or participant.left_at is not None:
        return None
    participant.admitted = True
    db.commit()
    return participant


def deny_or_remove(
    db: Session, meeting_id: str, participant_id: int, *, admitted: bool
) -> Participant | None:
    """Deny a waiting participant (admitted=False) or eject an admitted one (admitted=True).

    Returns None when the target is missing, the host, or not in the expected state.
    """
    participant = _get_in_meeting(db, meeting_id, participant_id)
    if (
        participant is None
        or participant.role == ParticipantRole.HOST
        or participant.admitted != admitted
    ):
        return None
    if participant.left_at is None:
        participant.left_at = utcnow()
        db.commit()
    return participant
