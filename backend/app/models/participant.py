import enum
import secrets
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.clock import utcnow
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.meeting import Meeting


class ParticipantRole(str, enum.Enum):
    HOST = "host"
    COHOST = "cohost"
    PARTICIPANT = "participant"


class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    meeting_id: Mapped[str] = mapped_column(
        ForeignKey("meetings.id", ondelete="CASCADE"), index=True
    )
    display_name: Mapped[str] = mapped_column(String(100))
    role: Mapped[ParticipantRole] = mapped_column(
        Enum(ParticipantRole, native_enum=False, length=16),
        default=ParticipantRole.PARTICIPANT,
    )
    # Secret returned once at join; authenticates this participant's socket and token claims.
    session_key: Mapped[str] = mapped_column(String(64), default=lambda: secrets.token_urlsafe(24))
    # False while held in the waiting room; no media token is issued until admitted.
    admitted: Mapped[bool] = mapped_column(Boolean, default=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    left_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    meeting: Mapped["Meeting"] = relationship(back_populates="participants")
