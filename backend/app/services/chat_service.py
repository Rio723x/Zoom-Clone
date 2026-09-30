from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Message

HISTORY_LIMIT = 200


def add_message(db: Session, meeting_id: str, sender_name: str, text: str) -> Message:
    message = Message(meeting_id=meeting_id, sender_name=sender_name, text=text)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def recent_messages(db: Session, meeting_id: str, limit: int = HISTORY_LIMIT) -> list[Message]:
    stmt = (
        select(Message)
        .where(Message.meeting_id == meeting_id)
        .order_by(Message.id.desc())
        .limit(limit)
    )
    return list(reversed(db.scalars(stmt).all()))
