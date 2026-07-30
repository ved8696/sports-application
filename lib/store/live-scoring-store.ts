"use client";

// Client orchestration for live scoring: loads/starts a match, routes every
// scoring action through the pure engine (lib/liveScoring/engine.ts), keeps
// an in-memory Undo stack of prior full-state snapshots, and persists the
// resulting snapshot to /api/live/[id] after every mutation so nothing is
// ever lost mid-innings. Mirrors the shape of lib/store/fixture-store.ts and
// lib/store/match-setup-store.ts from Sprints 2-3.
//
// The Undo stack intentionally lives only in memory (not sessionStorage) --
// undo is a within-session scorer correction tool, not a durable history;
// the persisted /api/live snapshot is the durable record. Each entry is a
// full LiveMatchState, which is also what makes adding Redo later trivial
// (push undone states onto a second stack instead of discarding them).

import { create } from "zustand";
import type { BallInput, InningsState, LiveMatchState } from "@/lib/liveScoring/types";
import { applyBall, applyPenalty, applyRetirement, insertNewBatter, setBowler } from "@/lib/liveScoring/engine";
import type { OpeningSelection } from "@/lib/liveScoring/initialize";

export type LiveLoadStatus = "idle" | "loading" | "ready" | "not-started" | "error";

const UNDO_LIMIT = 40;

interface LiveScoringStoreState {
  state: LiveMatchState | null;
  status: LiveLoadStatus;
  error: string | null;
  saving: boolean;
  undoStack: LiveMatchState[];

  load: (fixtureId: string) => Promise<void>;
  start: (fixtureId: string, openers: OpeningSelection) => Promise<void>;
  recordBall: (input: BallInput) => Promise<void>;
  addPenaltyRuns: (runs: number) => Promise<void>;
  retire: (playerOut: string, type: "retired-hurt" | "retired-out") => Promise<void>;
  selectNewBatter: (name: string) => Promise<void>;
  selectNewBowler: (name: string) => Promise<void>;
  undo: () => Promise<void>;
  reset: () => void;
}

function activeInnings(state: LiveMatchState): InningsState | null {
  return state.currentInnings === 1 ? state.innings1 : state.innings2;
}

function withInnings(state: LiveMatchState, innings: InningsState): LiveMatchState {
  return state.currentInnings === 1 ? { ...state, innings1: innings } : { ...state, innings2: innings };
}

async function persist(state: LiveMatchState): Promise<LiveMatchState> {
  const res = await fetch(`/api/live/${state.fixtureId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string });
    throw new Error(body.error ?? `Failed to save match state (HTTP ${res.status})`);
  }
  const { state: saved }: { state: LiveMatchState } = await res.json();
  return saved;
}

export const useLiveScoringStore = create<LiveScoringStoreState>((set, get) => {
  async function commit(previous: LiveMatchState, next: LiveMatchState) {
    set((s) => ({ state: next, saving: true, error: null, undoStack: [...s.undoStack, previous].slice(-UNDO_LIMIT) }));
    try {
      const saved = await persist(next);
      set({ state: saved, saving: false });
    } catch (err) {
      set({ saving: false, error: err instanceof Error ? err.message : "Failed to save match state" });
    }
  }

  function withActiveInnings(mutate: (innings: InningsState) => InningsState) {
    const current = get().state;
    if (!current) return;
    const innings = activeInnings(current);
    if (!innings) return;
    void commit(current, withInnings(current, mutate(innings)));
  }

  return {
    state: null,
    status: "idle",
    error: null,
    saving: false,
    undoStack: [],

    load: async (fixtureId) => {
      set({ status: "loading", error: null });
      try {
        const res = await fetch(`/api/live/${fixtureId}`);
        if (res.status === 404) {
          set({ status: "not-started", state: null });
          return;
        }
        if (!res.ok) throw new Error(`Failed to load live match (HTTP ${res.status})`);
        const { state }: { state: LiveMatchState } = await res.json();
        set({ status: "ready", state, undoStack: [] });
      } catch (err) {
        set({ status: "error", error: err instanceof Error ? err.message : "Unknown error loading live match" });
      }
    },

    start: async (fixtureId, openers) => {
      set({ status: "loading", error: null });
      try {
        const res = await fetch(`/api/live/${fixtureId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(openers),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}) as { error?: string });
          throw new Error(body.error ?? `Failed to start the match (HTTP ${res.status})`);
        }
        const { state }: { state: LiveMatchState } = await res.json();
        set({ status: "ready", state, undoStack: [] });
      } catch (err) {
        set({ status: "error", error: err instanceof Error ? err.message : "Unknown error starting the match" });
      }
    },

    recordBall: async (input) => {
      const current = get().state;
      if (!current) return;
      const innings = activeInnings(current);
      if (!innings) return;
      const { innings: nextInnings } = applyBall(innings, input, { freeHitEnabled: current.rules.freeHit });
      await commit(current, withInnings(current, nextInnings));
    },

    addPenaltyRuns: async (runs) => {
      withActiveInnings((innings) => applyPenalty(innings, runs).innings);
    },

    retire: async (playerOut, type) => {
      withActiveInnings((innings) => applyRetirement(innings, playerOut, type).innings);
    },

    selectNewBatter: async (name) => {
      withActiveInnings((innings) => insertNewBatter(innings, name));
    },

    selectNewBowler: async (name) => {
      withActiveInnings((innings) => setBowler(innings, name));
    },

    undo: async () => {
      const { undoStack } = get();
      if (undoStack.length === 0) return;
      const previous = undoStack[undoStack.length - 1];
      set({ undoStack: undoStack.slice(0, -1), saving: true });
      try {
        const saved = await persist(previous);
        set({ state: saved, saving: false });
      } catch (err) {
        set({ saving: false, error: err instanceof Error ? err.message : "Failed to undo" });
      }
    },

    reset: () => set({ state: null, status: "idle", error: null, undoStack: [] }),
  };
});
