import { create } from "zustand";

interface UserStore {
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    email: string;
  } | null;
  setUser: (user: UserStore["user"]) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
