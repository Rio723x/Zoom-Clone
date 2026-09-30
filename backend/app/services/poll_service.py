from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Poll, PollOption, PollVote


def create_poll(db: Session, meeting_id: str, question: str, options: list[str]) -> Poll:
    poll = Poll(
        meeting_id=meeting_id,
        question=question,
        options=[PollOption(text=text) for text in options],
    )
    db.add(poll)
    db.commit()
    db.refresh(poll)
    return poll


def get_poll(db: Session, meeting_id: str, poll_id: int) -> Poll | None:
    poll = db.get(Poll, poll_id)
    return poll if poll is not None and poll.meeting_id == meeting_id else None


def list_polls(db: Session, meeting_id: str) -> list[Poll]:
    return list(db.scalars(select(Poll).where(Poll.meeting_id == meeting_id).order_by(Poll.id)))


def close_poll(db: Session, poll: Poll) -> Poll:
    poll.is_open = False
    db.commit()
    db.refresh(poll)
    return poll


def vote(db: Session, poll: Poll, participant_id: int, option_id: int) -> Poll | None:
    """Record or change a participant's vote. Returns None if the poll is closed or the option is foreign."""
    if not poll.is_open or option_id not in {o.id for o in poll.options}:
        return None

    existing = db.scalar(
        select(PollVote).where(PollVote.poll_id == poll.id, PollVote.participant_id == participant_id)
    )
    if existing is None:
        db.add(PollVote(poll_id=poll.id, option_id=option_id, participant_id=participant_id))
    else:
        existing.option_id = option_id
    db.commit()
    db.refresh(poll)
    return poll


def votes_by_participant(db: Session, meeting_id: str, participant_id: int) -> dict[int, int]:
    """poll_id -> option_id chosen by this participant."""
    stmt = (
        select(PollVote.poll_id, PollVote.option_id)
        .join(Poll, Poll.id == PollVote.poll_id)
        .where(Poll.meeting_id == meeting_id, PollVote.participant_id == participant_id)
    )
    return {poll_id: option_id for poll_id, option_id in db.execute(stmt)}
