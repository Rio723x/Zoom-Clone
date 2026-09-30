from fastapi import APIRouter

from app.api.routes import meetings, participants
from app.ws import router as ws_router

api_router = APIRouter(prefix="/api")
api_router.include_router(meetings.router)
api_router.include_router(participants.router)
api_router.include_router(ws_router.router)
