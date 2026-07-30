"use client";

// Global client-side store for created (scheduled) matches, mirroring the
// shape of lib/store/cricket-store.ts. Loaded from /api/fixtures; a freshly
// created fixture is prepended locally too, so the Dashboard and Matches list
// reflect it immediately without a re-fetch.

import { create } from "zustand";
import type { Fixture, FixtureDraft, FixturePatch } from "@/lib/cricket/fixture-types";

export type FixtureLoadStatus = "idle" | "loading" | "ready" | "error";

interface FixtureStoreState {
  status: FixtureLoadStatus;
  error: string | null;
  fixtures: Fixture[];
  load: () => Promise<void>;
  createFixture: (draft: FixtureDraft) => Promise<Fixture>;
  updateFixture: (id: string, patch: FixturePatch) => Promise<Fixture>;
}

export const useFixtureStore = create<FixtureStoreState>((set, get) => ({
  status: "idle",
  error: null,
  fixtures: [],

  load: async () => {
    if (get().status === "loading" || get().status === "ready") return;
    set({ status: "loading", error: null });
    try {
      const res = await fetch("/api/fixtures");
      if (!res.ok) throw new Error(`Failed to load matches (HTTP ${res.status})`);
      const data: { fixtures: Fixture[] } = await res.json();
      set({ fixtures: data.fixtures ?? [], status: "ready" });
    } catch (err) {
      set({ status: "error", error: err instanceof Error ? err.message : "Unknown error loading matches" });
    }
  },

  createFixture: async (draft) => {
    const res = await fetch("/api/fixtures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string });
      throw new Error(body.error ?? `Failed to create match (HTTP ${res.status})`);
    }
    const { fixture }: { fixture: Fixture } = await res.json();
    set((s) => ({ fixtures: [fixture, ...s.fixtures], status: "ready" }));
    return fixture;
  },

  updateFixture: async (id, patch) => {
    const res = await fetch(`/api/fixtures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string });
      throw new Error(body.error ?? `Failed to update match (HTTP ${res.status})`);
    }
    const { fixture }: { fixture: Fixture } = await res.json();
    set((s) => ({ fixtures: s.fixtures.map((f) => (f.id === fixture.id ? fixture : f)) }));
    return fixture;
  },
}));
