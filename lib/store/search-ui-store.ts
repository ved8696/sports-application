"use client";

// Transient (non-persisted) open/close state for the full-screen Search &
// AI panel. Deliberately separate from lib/store/search-store.ts's
// persisted history/pins -- this one should always start closed on a fresh
// load, never survive a reload. A plain Zustand store rather than React
// Context so the trigger button in any page header and the single panel
// instance mounted at the root layout can both reach it without prop
// drilling, consistent with how the rest of the app shares client state.
import { create } from "zustand";

interface SearchUiState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useSearchUiStore = create<SearchUiState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
