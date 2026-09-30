import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  displayName: string;
  setDisplayName: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Empty until the person types one, like Zoom (no pre-filled "Guest").
      displayName: "",
      setDisplayName: (displayName) => set({ displayName }),
    }),
    {
      name: "vcm-user",
      version: 1,
      // v0 pre-filled "Guest" as the default name; treat that as "never set".
      migrate: (persisted) => {
        const state = persisted as Partial<UserState> | undefined;
        return { ...state, displayName: state?.displayName === "Guest" ? "" : (state?.displayName ?? "") };
      },
    },
  ),
);
