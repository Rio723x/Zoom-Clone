import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  micId?: string;
  cameraId?: string;
  speakerId?: string;
  /**
   * Zoom's "Original Sound": when true the mic bypasses browser DSP
   * (echo cancellation / noise suppression / auto-gain) for high-fidelity
   * raw audio. Default false = DSP on, matching Zoom's default.
   */
  originalSound: boolean;
  setMicId: (id: string) => void;
  setCameraId: (id: string) => void;
  setSpeakerId: (id: string) => void;
  setOriginalSound: (on: boolean) => void;
}

/** Persisted device selections, shared by PreJoin, the meeting, and Settings. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      micId: undefined,
      cameraId: undefined,
      speakerId: undefined,
      originalSound: false,
      setMicId: (micId) => set({ micId }),
      setCameraId: (cameraId) => set({ cameraId }),
      setSpeakerId: (speakerId) => set({ speakerId }),
      setOriginalSound: (originalSound) => set({ originalSound }),
    }),
    { name: "zoom-clone-settings" },
  ),
);
