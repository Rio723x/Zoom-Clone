from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.services.videosdk_service import VideoSDKError


class MeetingNotFoundError(Exception):
    def __init__(self, meeting_id: str):
        super().__init__(f"Meeting {meeting_id} not found")
        self.meeting_id = meeting_id


class MeetingEndedError(Exception):
    pass


class MeetingLockedError(Exception):
    pass


class InvalidHostTokenError(Exception):
    pass


class InvalidSessionError(Exception):
    """Unknown participant or wrong session key."""


class NotAdmittedError(Exception):
    """Still waiting for the host to admit them."""


class ParticipantRemovedError(Exception):
    """Denied, removed or already left; they must join again."""


def _handler(status_code: int, detail: str):
    async def handle(_: Request, __: Exception) -> JSONResponse:
        return JSONResponse(status_code=status_code, content={"detail": detail})

    return handle


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(MeetingNotFoundError, _handler(404, "Meeting not found"))
    app.add_exception_handler(MeetingEndedError, _handler(410, "This meeting has ended"))
    app.add_exception_handler(MeetingLockedError, _handler(403, "This meeting is locked"))
    app.add_exception_handler(InvalidHostTokenError, _handler(403, "Invalid host token"))
    app.add_exception_handler(InvalidSessionError, _handler(403, "Invalid session"))
    app.add_exception_handler(NotAdmittedError, _handler(403, "Waiting for the host to admit you"))
    app.add_exception_handler(ParticipantRemovedError, _handler(403, "You are no longer in this meeting"))
    app.add_exception_handler(VideoSDKError, _handler(502, "Video service unavailable"))
