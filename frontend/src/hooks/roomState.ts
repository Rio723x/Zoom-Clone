import type { ServerEvent } from "@/lib/socketEvents";
import type {
  ChatMessage,
  MeetingControls,
  ParticipantRole,
  RosterEntry,
  ServerPoll,
  WaitingEntry,
} from "@/lib/types";

export type RoomStatus = "connecting" | "waiting" | "connected" | "closed";

/** Why the room socket ended for good (no more reconnect attempts). */
export type CloseReason =
  | "removed"
  | "denied"
  | "meeting-ended"
  | "rejected"
  | "replaced"
  | "connection-lost";

export interface RoomState {
  status: RoomStatus;
  closeReason: CloseReason | null;
  role: ParticipantRole | null;
  controls: MeetingControls | null;
  participants: RosterEntry[];
  waiting: WaitingEntry[];
  messages: ChatMessage[];
  polls: ServerPoll[];
  /** poll id -> option id this participant chose. */
  myVotes: Record<number, number>;
}

export const initialRoomState: RoomState = {
  status: "connecting",
  closeReason: null,
  role: null,
  controls: null,
  participants: [],
  waiting: [],
  messages: [],
  polls: [],
  myVotes: {},
};

export type RoomAction =
  | ServerEvent
  | { type: "reconnecting" }
  | { type: "closed"; reason: CloseReason };

const upsertById = <T extends { id: number }>(items: T[], item: T): T[] =>
  items.some((i) => i.id === item.id)
    ? items.map((i) => (i.id === item.id ? item : i))
    : [...items, item];

/**
 * Pure reducer: every server event maps to one state change. A `state` snapshot replaces
 * everything, which is what makes reconnecting safe (missed events are covered by it).
 * Transient events (reaction, mute, error) carry no state and are handled by callbacks.
 */
export function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case "state":
      return {
        ...state,
        status: "connected",
        closeReason: null,
        role: action.you.role,
        controls: action.controls,
        participants: action.participants,
        waiting: action.waiting,
        messages: action.messages,
        polls: action.polls,
        myVotes: Object.fromEntries(
          Object.entries(action.my_votes).map(([pollId, optionId]) => [Number(pollId), optionId]),
        ),
      };
    case "waiting":
      return { ...state, status: "waiting" };
    case "reconnecting":
      return state.status === "closed" ? state : { ...state, status: "connecting" };
    case "closed":
      return { ...state, status: "closed", closeReason: action.reason };
    case "denied":
    case "removed":
    case "meeting-ended":
      return { ...state, status: "closed", closeReason: action.type };
    case "participant-joined":
      return { ...state, participants: upsertById(state.participants, action.participant) };
    case "participant-left":
      return {
        ...state,
        participants: state.participants.filter((p) => p.id !== action.participant_id),
      };
    case "waiting-joined":
      return { ...state, waiting: upsertById(state.waiting, action.participant) };
    case "waiting-left":
      return { ...state, waiting: state.waiting.filter((w) => w.id !== action.participant_id) };
    case "controls-updated":
      return { ...state, controls: action.controls };
    case "chat":
      return state.messages.some((m) => m.id === action.message.id)
        ? state
        : { ...state, messages: [...state.messages, action.message] };
    case "hand":
      return {
        ...state,
        participants: state.participants.map((p) =>
          p.id === action.participant_id ? { ...p, hand_raised: action.raised } : p,
        ),
      };
    case "poll-created":
    case "poll-updated":
      return { ...state, polls: upsertById(state.polls, action.poll) };
    case "vote-recorded":
      return { ...state, myVotes: { ...state.myVotes, [action.poll_id]: action.option_id } };
    default:
      return state;
  }
}
