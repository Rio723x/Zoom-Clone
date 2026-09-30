from dataclasses import dataclass
from typing import Any

from fastapi import WebSocket

from app.models import ParticipantRole


@dataclass
class Connection:
    websocket: WebSocket
    participant_id: int
    name: str
    role: ParticipantRole
    admitted: bool
    hand_raised: bool = False

    @property
    def is_host(self) -> bool:
        return self.role == ParticipantRole.HOST


class RoomManager:
    """In-memory registry of live sockets per meeting (single-process; see README for scaling)."""

    def __init__(self) -> None:
        self._rooms: dict[str, dict[int, Connection]] = {}

    def reset(self) -> None:
        self._rooms.clear()

    async def connect(self, meeting_id: str, conn: Connection) -> None:
        room = self._rooms.setdefault(meeting_id, {})
        previous = room.get(conn.participant_id)
        room[conn.participant_id] = conn
        if previous is not None:  # reconnect: the newer socket wins
            await self._close_quietly(previous.websocket, 4409)

    def disconnect(self, meeting_id: str, conn: Connection) -> None:
        room = self._rooms.get(meeting_id)
        if room is None:
            return
        # Only drop the entry if it is still this socket (a reconnect may have replaced it).
        if room.get(conn.participant_id) is conn:
            del room[conn.participant_id]
        if not room:
            del self._rooms[meeting_id]

    def get(self, meeting_id: str, participant_id: int) -> Connection | None:
        return self._rooms.get(meeting_id, {}).get(participant_id)

    def connections(self, meeting_id: str) -> list[Connection]:
        return list(self._rooms.get(meeting_id, {}).values())

    def admitted(self, meeting_id: str) -> list[Connection]:
        return [c for c in self.connections(meeting_id) if c.admitted]

    def waiting(self, meeting_id: str) -> list[Connection]:
        return [c for c in self.connections(meeting_id) if not c.admitted]

    async def send(self, meeting_id: str, conn: Connection, payload: dict[str, Any]) -> None:
        try:
            await conn.websocket.send_json(payload)
        except Exception:
            # Dead socket: forget it so later broadcasts don't keep failing on it.
            self.disconnect(meeting_id, conn)

    async def broadcast(
        self, meeting_id: str, payload: dict[str, Any], *, exclude: int | None = None
    ) -> None:
        """Send to everyone admitted to the meeting (waiting participants never see room traffic)."""
        for conn in self.admitted(meeting_id):
            if conn.participant_id != exclude:
                await self.send(meeting_id, conn, payload)

    async def send_to_hosts(self, meeting_id: str, payload: dict[str, Any]) -> None:
        for conn in self.admitted(meeting_id):
            if conn.is_host:
                await self.send(meeting_id, conn, payload)

    async def eject(self, meeting_id: str, conn: Connection, payload: dict[str, Any]) -> None:
        """Tell one participant why they are being dropped, then close their socket."""
        await self.send(meeting_id, conn, payload)
        self.disconnect(meeting_id, conn)
        await self._close_quietly(conn.websocket, 4403)

    async def close_room(self, meeting_id: str, payload: dict[str, Any]) -> None:
        for conn in self.connections(meeting_id):
            await self.eject(meeting_id, conn, payload)

    @staticmethod
    async def _close_quietly(websocket: WebSocket, code: int) -> None:
        try:
            await websocket.close(code=code)
        except Exception:
            pass


room_manager = RoomManager()
