import type {
  ChatMessage,
  MeetingControls,
  ParticipantRole,
  RosterEntry,
  ServerPoll,
  WaitingEntry,
} from "./types";

/** Client -> server. Host-only events are rejected server-side for everyone else. */
export type ClientEvent =
  | { type: "chat"; text: string }
  | { type: "reaction"; emoji: string }
  | { type: "raise-hand"; raised: boolean }
  | { type: "poll-vote"; poll_id: number; option_id: number }
  | { type: "poll-create"; question: string; options: string[] }
  | { type: "poll-close"; poll_id: number }
  | ({ type: "set-controls" } & Partial<MeetingControls>)
  | { type: "admit"; participant_id: number }
  | { type: "deny"; participant_id: number }
  | { type: "remove"; participant_id: number }
  | { type: "mute"; target: number | "all" }
  | { type: "end-meeting" };

/** Server -> client. Mirrors backend/app/ws/handlers.py. */
export type ServerEvent =
  | {
      type: "state";
      you: { participant_id: number; role: ParticipantRole };
      controls: MeetingControls;
      participants: RosterEntry[];
      waiting: WaitingEntry[];
      messages: ChatMessage[];
      polls: ServerPoll[];
      my_votes: Record<string, number>;
    }
  | { type: "waiting" }
  | { type: "admitted" }
  | { type: "denied" }
  | { type: "removed" }
  | { type: "meeting-ended" }
  | { type: "participant-joined"; participant: RosterEntry }
  | { type: "participant-left"; participant_id: number }
  | { type: "waiting-joined"; participant: WaitingEntry }
  | { type: "waiting-left"; participant_id: number }
  | { type: "controls-updated"; controls: MeetingControls }
  | { type: "chat"; message: ChatMessage }
  | { type: "reaction"; participant_id: number; emoji: string }
  | { type: "hand"; participant_id: number; raised: boolean }
  | { type: "poll-created"; poll: ServerPoll }
  | { type: "poll-updated"; poll: ServerPoll }
  | { type: "vote-recorded"; poll_id: number; option_id: number }
  | { type: "mute"; by: number }
  | { type: "error"; code: string };

/** Close codes chosen by the backend (app/ws/router.py, app/ws/manager.py). */
export const CLOSE_UNAUTHORIZED = 4403;
export const CLOSE_REPLACED = 4409;
