import type { MeetingControls } from "./types";

export type Permission = "share" | "chat" | "unmute";

/** Host controls in the shape the Security menu and control bar consume. */
export interface ControlsView {
  locked: boolean;
  waitingRoomEnabled: boolean;
  permissions: Record<Permission, boolean>;
}

/** Field on the server's MeetingControls that backs each participant permission. */
export const PERMISSION_FIELD = {
  share: "allow_share",
  chat: "allow_chat",
  unmute: "allow_unmute",
} as const satisfies Record<Permission, keyof MeetingControls>;

const OPEN_MEETING: ControlsView = {
  locked: false,
  waitingRoomEnabled: false,
  permissions: { share: true, chat: true, unmute: true },
};

/** Server state -> UI shape. Until the first snapshot arrives the meeting is treated as open. */
export function toControlsView(controls: MeetingControls | null): ControlsView {
  if (!controls) return OPEN_MEETING;
  return {
    locked: controls.locked,
    waitingRoomEnabled: controls.waiting_room,
    permissions: {
      share: controls.allow_share,
      chat: controls.allow_chat,
      unmute: controls.allow_unmute,
    },
  };
}
