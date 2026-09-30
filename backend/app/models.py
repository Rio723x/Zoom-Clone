from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)       # minutes
    created_at = Column(DateTime, default=datetime.utcnow)
    is_instant = Column(Boolean, default=False)


class RecentMeeting(Base):
    __tablename__ = "recent_meetings"

    id = Column(String, primary_key=True, index=True)
    meeting_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    host_name = Column(String, nullable=True)
    ended_at = Column(DateTime, default=datetime.utcnow)
    duration_minutes = Column(Integer, nullable=True)
