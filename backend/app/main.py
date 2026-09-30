from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app import models, schemas
from app.database import engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Video Conferencing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_meeting_id():
    """Generate a Zoom-style meeting ID: 3 groups of 3 digits."""
    hex_id = uuid.uuid4().hex[:9]
    return f"{hex_id[:3]}-{hex_id[3:6]}-{hex_id[6:]}"


# ─────────────────────────── MEETINGS ───────────────────────────

@app.post("/api/meetings/instant", response_model=schemas.MeetingResponse)
def create_instant_meeting(db: Session = Depends(get_db)):
    meeting_id = generate_meeting_id()
    new_meeting = models.Meeting(
        id=meeting_id,
        title="Instant Meeting",
        is_instant=True
    )
    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)
    return new_meeting


@app.post("/api/meetings/schedule", response_model=schemas.MeetingResponse)
def schedule_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    meeting_id = generate_meeting_id()
    new_meeting = models.Meeting(
        id=meeting_id,
        title=meeting.title,
        description=meeting.description,
        scheduled_at=meeting.scheduled_at,
        duration=meeting.duration,
        is_instant=False
    )
    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)
    return new_meeting


@app.get("/api/meetings/upcoming", response_model=List[schemas.MeetingResponse])
def get_upcoming_meetings(db: Session = Depends(get_db)):
    from datetime import datetime
    return (
        db.query(models.Meeting)
        .filter(models.Meeting.is_instant == False)
        .filter(models.Meeting.scheduled_at != None)
        .order_by(models.Meeting.scheduled_at)
        .all()
    )


@app.get("/api/meetings/recent", response_model=List[schemas.RecentMeetingResponse])
def get_recent_meetings(db: Session = Depends(get_db)):
    return (
        db.query(models.RecentMeeting)
        .order_by(models.RecentMeeting.ended_at.desc())
        .limit(20)
        .all()
    )


@app.get("/api/meetings", response_model=List[schemas.MeetingResponse])
def get_all_meetings(db: Session = Depends(get_db)):
    return db.query(models.Meeting).order_by(models.Meeting.scheduled_at).all()


@app.get("/api/meetings/{meeting_id}", response_model=schemas.MeetingResponse)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@app.post("/api/meetings/{meeting_id}/end")
def end_meeting(meeting_id: str, body: schemas.EndMeetingRequest, db: Session = Depends(get_db)):
    """Record a completed meeting into the recent-meetings log."""
    from datetime import datetime
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    title = meeting.title if meeting else "Meeting"

    recent = models.RecentMeeting(
        id=str(uuid.uuid4()),
        meeting_id=meeting_id,
        title=title,
        host_name=body.host_name,
        ended_at=datetime.utcnow(),
        duration_minutes=body.duration_minutes,
    )
    db.add(recent)
    db.commit()
    return {"ok": True}


@app.delete("/api/meetings/{meeting_id}")
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
    return {"ok": True}

from fastapi import WebSocket, WebSocketDisconnect
import json

class ConnectionManager:
    def __init__(self):
        # meeting_id -> { client_id: websocket }
        self.active_connections: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meeting_id: str, client_id: str):
        await websocket.accept()
        if meeting_id not in self.active_connections:
            self.active_connections[meeting_id] = {}
        self.active_connections[meeting_id][client_id] = websocket

    def disconnect(self, meeting_id: str, client_id: str):
        if meeting_id in self.active_connections:
            if client_id in self.active_connections[meeting_id]:
                del self.active_connections[meeting_id][client_id]
            if not self.active_connections[meeting_id]:
                del self.active_connections[meeting_id]

    async def broadcast(self, meeting_id: str, message: dict, exclude: str = None):
        if meeting_id in self.active_connections:
            for cid, ws in self.active_connections[meeting_id].items():
                if cid != exclude:
                    try:
                        await ws.send_json(message)
                    except:
                        pass

manager = ConnectionManager()

@app.websocket("/api/ws/{meeting_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, meeting_id: str, client_id: str):
    await manager.connect(websocket, meeting_id, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            target = message.get("target")
            if target and meeting_id in manager.active_connections and target in manager.active_connections[meeting_id]:
                await manager.active_connections[meeting_id][target].send_text(data)
            else:
                await manager.broadcast(meeting_id, message, exclude=client_id)
    except WebSocketDisconnect:
        manager.disconnect(meeting_id, client_id)
        await manager.broadcast(meeting_id, {"type": "user-left", "clientId": client_id})
