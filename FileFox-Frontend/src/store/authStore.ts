import { create } from "zustand";

type User = any;

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;

  setSession: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  setSession: (access, refresh) =>
    set({ accessToken: access, refreshToken: refresh }),

  setUser: (user) => set({ user }),

  clear: () => set({ accessToken: null, refreshToken: null, user: null }),
}));