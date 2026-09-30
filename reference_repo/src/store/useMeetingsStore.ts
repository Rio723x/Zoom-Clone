import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ScheduledMeeting {
  id: string;
  topic: string;
  roomId: string;
  /** ISO datetime string for the scheduled start */
  startsAt: string;
  durationMinutes: number;
  hostName: string;
  videoOn: boolean;
  muteOnEntry: boolean;
}

interface MeetingsState {
  meetings: ScheduledMeeting[];
  addMeeting: (meeting: ScheduledMeeting) => void;
  removeMeeting: (id: string) => void;
}

export const useMeetingsStore = create<MeetingsState>()(
  persist(
    (set) => ({
      meetings: [],
      addMeeting: (meeting) =>
        set((state) => ({ meetings: [...state.meetings, meeting] })),
      removeMeeting: (id) =>
        set((state) => ({
          meetings: state.meetings.filter((m) => m.id !== id),
        })),
    }),
    { name: "zoom-clone-meetings" },
  ),
);
