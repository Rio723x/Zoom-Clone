import { create } from "zustand";

export type Role = "host" | "participant";

interface SessionState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  role: "participant",
  setRole: (role) => set({ role }),
}));
