import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "buyer";
  phone?: string;
  city?: string;
  picture?: string;
  authProvider?: "local" | "google";
};

type AuthState = {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string | null) => void;
  updateUser: (fields: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        })),
      logout: () => {
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem("ye-chalegi-auth");
          } catch {
            // ignore localStorage access errors (e.g. private browsing)
          }
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "ye-chalegi-auth" },
  ),
);
