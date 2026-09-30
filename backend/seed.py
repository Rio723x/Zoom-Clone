import uuid
from datetime import datetime, timedelta, timezone
from app.database import SessionLocal, engine
from app import models

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)


def seed_db():
    db = SessionLocal()

    # Clear existing data for a clean slate
    db.query(models.RecentMeeting).delete()
    db.query(models.Meeting).delete()
    db.commit()

    now = datetime.now(timezone.utc)

    # ── Upcoming scheduled meetings ──────────────────────────────────────
    upcoming = [
        models.Meeting(
            id="892-573-401",
            title="Weekly Team Sync",
            description="Our regular Monday stand-up.",
            scheduled_at=now + timedelta(days=1, hours=2),
            duration=60,
            is_instant=False,
        ),
        models.Meeting(
            id="134-820-675",
            title="Product Roadmap Review",
            description="Q4 planning session with all stakeholders.",
            scheduled_at=now + timedelta(days=2),
            duration=90,
            is_instant=False,
        ),
        models.Meeting(
            id="567-238-910",
            title="Client Presentation – Acme Corp",
            description="Demo of the new dashboard features.",
            scheduled_at=now + timedelta(days=3, hours=5),
            duration=45,
            is_instant=False,
        ),
        models.Meeting(
            id="301-994-822",
            title="Engineering Sprint Planning",
            scheduled_at=now + timedelta(days=5),
            duration=60,
            is_instant=False,
        ),
    ]

    # ── Recent (completed) meetings ──────────────────────────────────────
    recent = [
        models.RecentMeeting(
            id=str(uuid.uuid4()),
            meeting_id="771-002-443",
            title="Design Review",
            host_name="Alex Johnson",
            ended_at=now - timedelta(hours=2),
            duration_minutes=40,
        ),
        models.RecentMeeting(
            id=str(uuid.uuid4()),
            meeting_id="654-118-330",
            title="All-Hands Meeting",
            host_name="Alex Johnson",
            ended_at=now - timedelta(days=1),
            duration_minutes=90,
        ),
        models.RecentMeeting(
            id=str(uuid.uuid4()),
            meeting_id="489-762-051",
            title="1:1 with Manager",
            host_name="Alex Johnson",
            ended_at=now - timedelta(days=2),
            duration_minutes=30,
        ),
    ]

    db.add_all(upcoming + recent)
    db.commit()
    db.close()
    print("Database seeded successfully.")


if __name__ == "__main__":
    seed_db()
