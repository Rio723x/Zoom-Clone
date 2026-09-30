import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  displayName: string;
  setDisplayName: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      displayName: "Guest",
      setDisplayName: (displayName) => set({ displayName }),
    }),
    { name: "vcm-user" },
  ),
);
