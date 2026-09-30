"""Inbound WebSocket messages (client -> server), validated with a `type` discriminator."""

from typing import Annotated, Literal

from pydantic import BaseModel, Field, TypeAdapter


class ChatIn(BaseModel):
    type: Literal["chat"]
    text: str = Field(min_length=1, max_length=2000)


class ReactionIn(BaseModel):
    type: Literal["reaction"]
    emoji: str = Field(min_length=1, max_length=16)


class RaiseHandIn(BaseModel):
    type: Literal["raise-hand"]
    raised: bool


class PollCreateIn(BaseModel):
    type: Literal["poll-create"]
    question: str = Field(min_length=1, max_length=300)
    options: list[Annotated[str, Field(min_length=1, max_length=200)]] = Field(min_length=2, max_length=10)


class PollVoteIn(BaseModel):
    type: Literal["poll-vote"]
    poll_id: int
    option_id: int


class PollCloseIn(BaseModel):
    type: Literal["poll-close"]
    poll_id: int


class SetControlsIn(BaseModel):
    type: Literal["set-controls"]
    locked: bool | None = None
    waiting_room: bool | None = None
    allow_share: bool | None = None
    allow_chat: bool | None = None
    allow_unmute: bool | None = None


class AdmitIn(BaseModel):
    type: Literal["admit"]
    participant_id: int


class DenyIn(BaseModel):
    type: Literal["deny"]
    participant_id: int


class RemoveIn(BaseModel):
    type: Literal["remove"]
    participant_id: int


class MuteIn(BaseModel):
    type: Literal["mute"]
    target: int | Literal["all"]


class EndMeetingIn(BaseModel):
    type: Literal["end-meeting"]


InboundEvent = Annotated[
    ChatIn
    | ReactionIn
    | RaiseHandIn
    | PollCreateIn
    | PollVoteIn
    | PollCloseIn
    | SetControlsIn
    | AdmitIn
    | DenyIn
    | RemoveIn
    | MuteIn
    | EndMeetingIn,
    Field(discriminator="type"),
]

inbound_adapter: TypeAdapter[InboundEvent] = TypeAdapter(InboundEvent)

# Events only the host may send; enforced by role, never by anything the client claims.
HOST_ONLY_EVENTS = frozenset(
    {"poll-create", "poll-close", "set-controls", "admit", "deny", "remove", "mute", "end-meeting"}
)
