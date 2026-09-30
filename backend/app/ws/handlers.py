import logging
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any

from sqlalchemy.orm import Session, sessionmaker

from app.schemas import MeetingControls, MeetingControlsUpdate
from app.schemas.chat import MessageOut
from app.schemas.poll import PollOut
from app.services import chat_service, meeting_service, participant_service, poll_service
from app.ws import events
from app.ws.manager import Connection, RoomManager

logger = logging.getLogger(__name__)


@dataclass
class RoomContext:
    meeting_id: str
    conn: Connection
    session_factory: sessionmaker[Session]
    manager: RoomManager


def participant_payload(conn: Connection) -> dict[str, Any]:
    return {
        "id": conn.participant_id,
        "name": conn.name,
        "role": conn.role.value,
        "hand_raised": conn.hand_raised,
    }


def build_state(
    session_factory: sessionmaker[Session], manager: RoomManager, meeting_id: str, conn: Connection
) -> dict[str, Any]:
    """Everything a client needs on (re)connect: roster, controls, chat and poll history."""
    with session_factory() as db:
        meeting = meeting_service.get_meeting(db, meeting_id)
        return {
            "type": "state",
            "you": {"participant_id": conn.participant_id, "role": conn.role.value},
            "controls": MeetingControls.model_validate(meeting).model_dump(),
            "participants": [participant_payload(c) for c in manager.admitted(meeting_id)],
            "waiting": (
                [{"id": c.participant_id, "name": c.name} for c in manager.waiting(meeting_id)]
                if conn.is_host
                else []
            ),
            "messages": [
                MessageOut.model_validate(m).model_dump(mode="json")
                for m in chat_service.recent_messages(db, meeting_id)
            ],
            "polls": [
                PollOut.model_validate(p).model_dump(mode="json")
                for p in poll_service.list_polls(db, meeting_id)
            ],
            "my_votes": poll_service.votes_by_participant(db, meeting_id, conn.participant_id),
        }


async def _error(ctx: RoomContext, code: str) -> None:
    await ctx.manager.send(ctx.meeting_id, ctx.conn, {"type": "error", "code": code})


# ───────────────────────────── everyone ─────────────────────────────


async def on_chat(ctx: RoomContext, ev: events.ChatIn) -> None:
    with ctx.session_factory() as db:
        meeting = meeting_service.get_meeting(db, ctx.meeting_id)
        if not ctx.conn.is_host and not meeting.allow_chat:
            return await _error(ctx, "chat-disabled")
        message = chat_service.add_message(db, ctx.meeting_id, ctx.conn.name, ev.text)
        payload = MessageOut.model_validate(message).model_dump(mode="json")
    payload["participant_id"] = ctx.conn.participant_id
    await ctx.manager.broadcast(ctx.meeting_id, {"type": "chat", "message": payload})


async def on_reaction(ctx: RoomContext, ev: events.ReactionIn) -> None:
    await ctx.manager.broadcast(
        ctx.meeting_id,
        {"type": "reaction", "participant_id": ctx.conn.participant_id, "emoji": ev.emoji},
    )


async def on_raise_hand(ctx: RoomContext, ev: events.RaiseHandIn) -> None:
    ctx.conn.hand_raised = ev.raised
    await ctx.manager.broadcast(
        ctx.meeting_id,
        {"type": "hand", "participant_id": ctx.conn.participant_id, "raised": ev.raised},
    )


async def on_poll_vote(ctx: RoomContext, ev: events.PollVoteIn) -> None:
    with ctx.session_factory() as db:
        poll = poll_service.get_poll(db, ctx.meeting_id, ev.poll_id)
        if poll is None:
            return await _error(ctx, "poll-not-found")
        if poll_service.vote(db, poll, ctx.conn.participant_id, ev.option_id) is None:
            return await _error(ctx, "vote-rejected")
        payload = PollOut.model_validate(poll).model_dump(mode="json")
    await ctx.manager.broadcast(ctx.meeting_id, {"type": "poll-updated", "poll": payload})
    await ctx.manager.send(
        ctx.meeting_id,
        ctx.conn,
        {"type": "vote-recorded", "poll_id": ev.poll_id, "option_id": ev.option_id},
    )


# ───────────────────────────── host only ─────────────────────────────


async def on_poll_create(ctx: RoomContext, ev: events.PollCreateIn) -> None:
    with ctx.session_factory() as db:
        poll = poll_service.create_poll(db, ctx.meeting_id, ev.question, ev.options)
        payload = PollOut.model_validate(poll).model_dump(mode="json")
    await ctx.manager.broadcast(ctx.meeting_id, {"type": "poll-created", "poll": payload})


async def on_poll_close(ctx: RoomContext, ev: events.PollCloseIn) -> None:
    with ctx.session_factory() as db:
        poll = poll_service.get_poll(db, ctx.meeting_id, ev.poll_id)
        if poll is None:
            return await _error(ctx, "poll-not-found")
        payload = PollOut.model_validate(poll_service.close_poll(db, poll)).model_dump(mode="json")
    await ctx.manager.broadcast(ctx.meeting_id, {"type": "poll-updated", "poll": payload})


async def on_set_controls(ctx: RoomContext, ev: events.SetControlsIn) -> None:
    update = MeetingControlsUpdate(**ev.model_dump(exclude={"type"}))
    with ctx.session_factory() as db:
        meeting = meeting_service.get_meeting(db, ctx.meeting_id)
        meeting = meeting_service.update_controls(db, meeting, update)
        controls = MeetingControls.model_validate(meeting).model_dump()
    await ctx.manager.broadcast(ctx.meeting_id, {"type": "controls-updated", "controls": controls})


async def on_admit(ctx: RoomContext, ev: events.AdmitIn) -> None:
    with ctx.session_factory() as db:
        participant = participant_service.admit(db, ctx.meeting_id, ev.participant_id)
    if participant is None:
        return await _error(ctx, "participant-not-found")

    target = ctx.manager.get(ctx.meeting_id, ev.participant_id)
    if target is not None and not target.admitted:
        target.admitted = True
        await ctx.manager.send(ctx.meeting_id, target, {"type": "admitted"})
        state = build_state(ctx.session_factory, ctx.manager, ctx.meeting_id, target)
        await ctx.manager.send(ctx.meeting_id, target, state)
        await ctx.manager.broadcast(
            ctx.meeting_id,
            {"type": "participant-joined", "participant": participant_payload(target)},
            exclude=target.participant_id,
        )
    await ctx.manager.send_to_hosts(
        ctx.meeting_id, {"type": "waiting-left", "participant_id": ev.participant_id}
    )


async def on_deny(ctx: RoomContext, ev: events.DenyIn) -> None:
    with ctx.session_factory() as db:
        participant = participant_service.deny_or_remove(
            db, ctx.meeting_id, ev.participant_id, admitted=False
        )
    if participant is None:
        return await _error(ctx, "participant-not-found")

    target = ctx.manager.get(ctx.meeting_id, ev.participant_id)
    if target is not None:
        await ctx.manager.eject(ctx.meeting_id, target, {"type": "denied"})
    await ctx.manager.send_to_hosts(
        ctx.meeting_id, {"type": "waiting-left", "participant_id": ev.participant_id}
    )


async def on_remove(ctx: RoomContext, ev: events.RemoveIn) -> None:
    with ctx.session_factory() as db:
        participant = participant_service.deny_or_remove(
            db, ctx.meeting_id, ev.participant_id, admitted=True
        )
    if participant is None:
        return await _error(ctx, "participant-not-found")

    target = ctx.manager.get(ctx.meeting_id, ev.participant_id)
    if target is not None:
        await ctx.manager.eject(ctx.meeting_id, target, {"type": "removed"})
    await ctx.manager.broadcast(
        ctx.meeting_id, {"type": "participant-left", "participant_id": ev.participant_id}
    )


async def on_mute(ctx: RoomContext, ev: events.MuteIn) -> None:
    if ev.target == "all":
        targets = [c for c in ctx.manager.admitted(ctx.meeting_id) if not c.is_host]
    else:
        target = ctx.manager.get(ctx.meeting_id, ev.target)
        targets = [target] if target is not None and target.admitted and not target.is_host else []
    for target in targets:
        await ctx.manager.send(
            ctx.meeting_id, target, {"type": "mute", "by": ctx.conn.participant_id}
        )


async def on_end_meeting(ctx: RoomContext, _: events.EndMeetingIn) -> None:
    with ctx.session_factory() as db:
        meeting_service.end_meeting(db, ctx.meeting_id, None)
    await ctx.manager.close_room(ctx.meeting_id, {"type": "meeting-ended"})


Handler = Callable[[RoomContext, Any], Awaitable[None]]

HANDLERS: dict[type, Handler] = {
    events.ChatIn: on_chat,
    events.ReactionIn: on_reaction,
    events.RaiseHandIn: on_raise_hand,
    events.PollVoteIn: on_poll_vote,
    events.PollCreateIn: on_poll_create,
    events.PollCloseIn: on_poll_close,
    events.SetControlsIn: on_set_controls,
    events.AdmitIn: on_admit,
    events.DenyIn: on_deny,
    events.RemoveIn: on_remove,
    events.MuteIn: on_mute,
    events.EndMeetingIn: on_end_meeting,
}


async def dispatch(ctx: RoomContext, event: events.InboundEvent) -> None:
    if not ctx.conn.admitted:
        return await _error(ctx, "not-admitted")
    if event.type in events.HOST_ONLY_EVENTS and not ctx.conn.is_host:
        return await _error(ctx, "forbidden")
    try:
        await HANDLERS[type(event)](ctx, event)
    except Exception:
        logger.exception("Failed handling %s for meeting %s", event.type, ctx.meeting_id)
        await _error(ctx, "internal-error")
