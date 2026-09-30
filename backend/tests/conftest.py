import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.database import Base, get_db, get_session_factory
from app.main import app
from app.services import videosdk_service
from app.ws.manager import room_manager

SECRET = "test-secret-that-is-at-least-32-bytes-long"


@pytest.fixture(autouse=True)
def fake_videosdk(monkeypatch):
    """Never hit the real VideoSDK API from tests."""
    monkeypatch.setattr(settings, "videosdk_api_key", "test-key")
    monkeypatch.setattr(settings, "videosdk_secret", SECRET)
    monkeypatch.setattr(videosdk_service, "create_room", lambda custom_id: f"room-{custom_id}")


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_session_factory] = lambda: TestingSession
    room_manager.reset()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    room_manager.reset()
