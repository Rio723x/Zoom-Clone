from pydantic import BaseModel, ConfigDict

from app.schemas.utc import UTCDatetime


class PollOptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    vote_count: int


class PollOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question: str
    is_open: bool
    created_at: UTCDatetime
    options: list[PollOptionOut]
