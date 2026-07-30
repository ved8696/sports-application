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
//
// Innings-end detection and match completion are orchestration concerns that
// span several lib/liveScoring modules (innings-end, target, result, report,
// potm, engine) -- they live here rather than in any single engine module
// for exactly that reason.

import { create } from "zustand";
import type { BallInput, InningsState, LiveMatchState, MatchResultDetail } from "@/lib/liveScoring/types";
import {
  applyBall,
  applyPenalty,
  applyRetirement,
  completeMatch,
  endInnings,
  insertNewBatter,
  pauseMatch as pauseMatchReducer,
  resumeMatch as resumeMatchReducer,
  setBowler,
  startSecondInnings as startSecondInningsReducer,
} from "@/lib/liveScoring/engine";
import type { OpeningSelection } from "@/lib/liveScoring/initialize";
import { checkInningsEnd } from "@/lib/liveScoring/innings-end";
import { computeTarget } from "@/lib/liveScoring/target";
import { computeMatchResult } from "@/lib/liveScoring/result";
import { generateMatchReport } from "@/lib/liveScoring/report";
import { computePlayerOfMatch } from "@/lib/liveScoring/potm";

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
  declareInnings: () => Promise<void>;
  startSecondInnings: (openers: OpeningSelection) => Promise<void>;
  pauseMatch: () => Promise<void>;
  resumeMatch: () => Promise<void>;
  finalizeAs: (type: "no-result" | "draw") => Promise<void>;
  undo: () => Promise<void>;
  reset: () => void;
}

function activeInnings(state: LiveMatchState): InningsState | null {
  return state.currentInnings === 1 ? state.innings1 : state.innings2;
}

function withInnings(state: LiveMatchState, innings: InningsState): LiveMatchState {
  return state.currentInnings === 1 ? { ...state, innings1: innings } : { ...state, innings2: innings };
}

/** Finalizes the currently-completed innings: innings 1 moves to a break, innings 2 ends the match with a computed result/report/POTM. */
function resolveInningsCompletion(state: LiveMatchState, closedInnings: InningsState): LiveMatchState {
  const afterClose = withInnings(state, closedInnings);
  if (state.currentInnings === 1) {
    return { ...afterClose, status: "innings-break" };
  }
  const target = computeTarget(state.innings1.totalRuns);
  const result = computeMatchResult(state.innings1, closedInnings, target);
  if (!result) return afterClose;
  const report = generateMatchReport(afterClose, result);
  const potm = computePlayerOfMatch(afterClose);
  return completeMatch(afterClose, result, report, potm);
}

/** Runs after every ball: checks whether the active innings just ended and, if so, applies the right transition. */
function applyInningsEndIfNeeded(state: LiveMatchState, innings: InningsState): LiveMatchState {
  const target = state.currentInnings === 2 ? computeTarget(state.innings1.totalRuns) : null;
  const check = checkInningsEnd(innings, state.oversLimit, target);
  if (!check.ended || !check.reason) return withInnings(state, innings);
  return resolveInningsCompletion(state, endInnings(innings, check.reason));
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

async function archiveIfCompleted(state: LiveMatchState): Promise<void> {
  if (state.status !== "completed") return;
  const res = await fetch(`/api/live/${state.fixtureId}/complete`, { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string });
    throw new Error(body.error ?? "Failed to archive the completed match.");
  }
}

export const useLiveScoringStore = create<LiveScoringStoreState>((set, get) => {
  async function commit(previous: LiveMatchState, next: LiveMatchState) {
    set((s) => ({ state: next, saving: true, error: null, undoStack: [...s.undoStack, previous].slice(-UNDO_LIMIT) }));
    try {
      const saved = await persist(next);
      set({ state: saved, saving: false });
      await archiveIfCompleted(saved);
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
        const message = err instanceof Error ? err.message : "Unknown error loading live match";
        console.error(`[live-scoring] Failed to load match ${fixtureId}:`, err);
        set({ status: "error", error: message });
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
        const message = err instanceof Error ? err.message : "Unknown error starting the match";
        console.error(`[live-scoring] Failed to start match ${fixtureId}:`, err);
        set({ status: "error", error: message });
      }
    },

    recordBall: async (input) => {
      const current = get().state;
      if (!current) return;
      const innings = activeInnings(current);
      if (!innings) return;
      const { innings: nextInnings } = applyBall(innings, input, { freeHitEnabled: current.rules.freeHit });
      await commit(current, applyInningsEndIfNeeded(current, nextInnings));
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

    declareInnings: async () => {
      const current = get().state;
      if (!current || current.currentInnings !== 1) return;
      await commit(current, resolveInningsCompletion(current, endInnings(current.innings1, "declared")));
    },

    startSecondInnings: async (openers) => {
      const current = get().state;
      if (!current) return;
      await commit(current, startSecondInningsReducer(current, openers));
    },

    pauseMatch: async () => {
      const current = get().state;
      if (!current) return;
      await commit(current, pauseMatchReducer(current));
    },

    resumeMatch: async () => {
      const current = get().state;
      if (!current) return;
      await commit(current, resumeMatchReducer(current));
    },

    finalizeAs: async (type) => {
      const current = get().state;
      if (!current) return;
      const result: MatchResultDetail = {
        type,
        summaryText: type === "no-result" ? "No result" : "Match drawn",
      };
      const report = generateMatchReport(current, result);
      const potm = computePlayerOfMatch(current);
      await commit(current, completeMatch(current, result, report, potm));
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
