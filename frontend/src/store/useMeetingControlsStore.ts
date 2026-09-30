import { create } from "zustand";

export type Permission = "share" | "chat" | "unmute";

interface ControlsSnapshot {
  locked: boolean;
  waitingRoomEnabled: boolean;
  permissions: Record<Permission, boolean>;
}

interface MeetingControlsState extends ControlsSnapshot {
  setLocked: (v: boolean) => void;
  setWaitingRoom: (v: boolean) => void;
  setPermission: (p: Permission, v: boolean) => void;
  /** Apply a full snapshot (used when a participant receives a HOST_CONTROL broadcast). */
  applySnapshot: (s: ControlsSnapshot) => void;
  /** Restore defaults -- call on meeting mount so controls never leak across meetings. */
  reset: () => void;
}

/** Fresh, unrestricted defaults for a new meeting. */
const DEFAULTS: ControlsSnapshot = {
  locked: false,
  waitingRoomEnabled: false,
  permissions: { share: true, chat: true, unmute: true },
};

/**
 * Host-side meeting controls (lock, waiting room, participant permissions).
 * A module singleton, so it MUST be reset() on each meeting mount -- otherwise a
 * lock/permission set in one meeting (or in Demo) leaks into the next.
 */
export const useMeetingControlsStore = create<MeetingControlsState>((set) => ({
  ...DEFAULTS,
  setLocked: (locked) => set({ locked }),
  setWaitingRoom: (waitingRoomEnabled) => set({ waitingRoomEnabled }),
  setPermission: (p, v) =>
    set((s) => ({ permissions: { ...s.permissions, [p]: v } })),
  applySnapshot: (snap) => set({ ...snap }),
  reset: () => set({ ...DEFAULTS, permissions: { ...DEFAULTS.permissions } }),
}));
