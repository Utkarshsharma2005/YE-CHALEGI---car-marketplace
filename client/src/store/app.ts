import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

type AppState = {
  theme: Theme;
  saved: string[];
  compare: string[];
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  toggleSaved: (id: string) => void;
  setSaved: (ids: string[]) => void;
  toggleCompare: (id: string) => void;
  setCompareCars: (ids: string[]) => void;
  clearCompare: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      saved: [],
      compare: [],
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      toggleSaved: (id) =>
        set((s) => ({
          saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
        })),
      setSaved: (ids) => set({ saved: ids }),
      toggleCompare: (id) =>
        set((s) => ({
          compare: s.compare.includes(id)
            ? s.compare.filter((x) => x !== id)
            : [...s.compare, id].slice(-2),
        })),
      setCompareCars: (ids) =>
        set({
          compare: Array.from(new Set(ids.filter(Boolean))).slice(-2),
        }),
      clearCompare: () => set({ compare: [] }),
    }),
    {
      name: "ye-chalegi-store",
      // Only persist the theme — saved cars are per-account and live in MongoDB,
      // so we never cache another user's data in localStorage.
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
