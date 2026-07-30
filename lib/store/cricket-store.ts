"use client";

// Global client-side store: loads every match from /api/cricket-data exactly
// once, caches it for the life of the session, and holds the current filter
// selection. No statistical computation happens in here -- see
// lib/cricket/useCricketDashboard.ts for the memoized selectors that read
// from this store.

import { create } from "zustand";
import type { Match, PlayerBio } from "@/lib/cricket/types";
import { defaultFilterState, type FilterState } from "@/lib/cricket/filters";

export type LoadStatus = "idle" | "loading" | "ready" | "error";

interface CricketStoreState {
  status: LoadStatus;
  error: string | null;
  matches: Match[];
  playerBios: Record<string, PlayerBio>;
  filters: FilterState;
  load: () => Promise<void>;
  reload: () => Promise<void>;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

async function fetchCricketData(): Promise<{ matches: Match[]; playerBios: Record<string, PlayerBio> }> {
  const res = await fetch("/api/cricket-data");
  if (!res.ok) throw new Error(`Failed to load cricket data (HTTP ${res.status})`);
  return res.json();
}

export const useCricketStore = create<CricketStoreState>((set, get) => ({
  status: "idle",
  error: null,
  matches: [],
  playerBios: {},
  filters: defaultFilterState(),

  load: async () => {
    if (get().status === "loading" || get().status === "ready") return;
    set({ status: "loading", error: null });
    try {
      const data = await fetchCricketData();
      set({ matches: data.matches ?? [], playerBios: data.playerBios ?? {}, status: "ready" });
    } catch (err) {
      set({ status: "error", error: err instanceof Error ? err.message : "Unknown error loading cricket data" });
    }
  },

  // Bypasses the "ready" short-circuit above -- used after a live match is
  // archived mid-session (e.g. a tournament match just completed) so
  // standings/analytics reflect it without requiring a full page reload.
  reload: async () => {
    try {
      const data = await fetchCricketData();
      set({ matches: data.matches ?? [], playerBios: data.playerBios ?? {}, status: "ready", error: null });
    } catch (err) {
      set({ status: "error", error: err instanceof Error ? err.message : "Unknown error loading cricket data" });
    }
  },

  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilterState() }),
}));
