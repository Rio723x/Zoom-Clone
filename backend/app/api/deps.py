import secrets

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import InvalidHostTokenError
from app.models import Meeting
from app.services import meeting_service


def require_host(
    meeting_id: str,
    x_host_token: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Meeting:
    """Guard for host-only REST actions: the caller must present the meeting's host token."""
    meeting = meeting_service.get_meeting(db, meeting_id)
    if x_host_token is None or not secrets.compare_digest(x_host_token, meeting.host_token):
        raise InvalidHostTokenError()
    return meeting
