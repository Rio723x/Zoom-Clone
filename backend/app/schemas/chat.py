from pydantic import BaseModel, ConfigDict

from app.schemas.utc import UTCDatetime


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_name: str
    text: str
    sent_at: UTCDatetime
