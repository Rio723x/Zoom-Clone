from typing import NamedTuple

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import get_session_factory
from app.core.exceptions import (
    InvalidSessionError,
    MeetingEndedError,
    MeetingNotFoundError,
    ParticipantRemovedError,
)
from app.models import MeetingStatus, ParticipantRole
from app.services import meeting_service, participant_service
from app.ws.events import inbound_adapter
from app.ws.handlers import RoomContext, build_state, dispatch, participant_payload
from app.ws.manager import Connection, room_manager

router = APIRouter()

CLOSE_UNAUTHORIZED = 4403


class Identity(NamedTuple):
    participant_id: int
    name: str
    role: ParticipantRole
    admitted: bool


def _authenticate(
    session_factory: sessionmaker[Session], meeting_id: str, participant_id: int, key: str
) -> Identity | None:
    try:
        with session_factory() as db:
            participant = participant_service.authenticate(db, meeting_id, participant_id, key)
            meeting = meeting_service.get_meeting(db, meeting_id)
            if meeting.status == MeetingStatus.ENDED:
                raise MeetingEndedError()
            if participant.left_at is not None:
                raise ParticipantRemovedError()
            return Identity(
                participant.id, participant.display_name, participant.role, participant.admitted
            )
    except (InvalidSessionError, MeetingNotFoundError, MeetingEndedError, ParticipantRemovedError):
        return None


@router.websocket("/ws/{meeting_id}")
async def meeting_socket(
    websocket: WebSocket,
    meeting_id: str,
    participant_id: int,
    key: str,
    session_factory: sessionmaker[Session] = Depends(get_session_factory),
) -> None:
    """Realtime channel for a participant: presence, chat, polls, reactions and host controls.

    Authenticated with the participant id + session key issued by the join endpoint;
    the participant's role comes from the server, never from the client.
    """
    identity = _authenticate(session_factory, meeting_id, participant_id, key)
    if identity is None:
        await websocket.close(code=CLOSE_UNAUTHORIZED)
        return

    await websocket.accept()
    conn = Connection(websocket, *identity)
    await room_manager.connect(meeting_id, conn)

    if conn.admitted:
        state = build_state(session_factory, room_manager, meeting_id, conn)
        await room_manager.send(meeting_id, conn, state)
        await room_manager.broadcast(
            meeting_id,
            {"type": "participant-joined", "participant": participant_payload(conn)},
            exclude=conn.participant_id,
        )
    else:
        await room_manager.send(meeting_id, conn, {"type": "waiting"})
        await room_manager.send_to_hosts(
            meeting_id,
            {"type": "waiting-joined", "participant": {"id": conn.participant_id, "name": conn.name}},
        )

    ctx = RoomContext(meeting_id, conn, session_factory, room_manager)
    try:
        while True:
            try:
                raw = await websocket.receive_json()
                event = inbound_adapter.validate_python(raw)
            except (ValueError, ValidationError):
                await room_manager.send(meeting_id, conn, {"type": "error", "code": "invalid-message"})
                continue
            await dispatch(ctx, event)
    except (WebSocketDisconnect, RuntimeError):
        pass
    finally:
        # Only announce departure if this socket is still the registered one; removal,
        # denial and reconnects already handled (or replaced) their own presence.
        still_registered = room_manager.get(meeting_id, conn.participant_id) is conn
        room_manager.disconnect(meeting_id, conn)
        if still_registered:
            if conn.admitted:
                await room_manager.broadcast(
                    meeting_id, {"type": "participant-left", "participant_id": conn.participant_id}
                )
            else:
                await room_manager.send_to_hosts(
                    meeting_id, {"type": "waiting-left", "participant_id": conn.participant_id}
                )
