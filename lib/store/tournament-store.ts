"use client";

// Global client-side store for Tournaments, mirroring lib/store/fixture-store.ts's
// shape exactly. Fixture generation deliberately does not go through a bulk
// server endpoint -- it loops the existing useFixtureStore().createFixture()
// once per pairing, so every tournament match is created through the exact
// same single-match path (and validation) as a standalone match.

import { create } from "zustand";
import type { Tournament, TournamentDraft, TournamentPatch } from "@/lib/tournament/types";
import { generateRoundRobin, generateKnockoutFirstRound, type Pairing } from "@/lib/tournament/bracket";
import { buildFixtureDraftFromPairing, scheduleDatesForPairings } from "@/lib/tournament/fixture-draft";
import { useFixtureStore } from "./fixture-store";

export type TournamentLoadStatus = "idle" | "loading" | "ready" | "error";

interface TournamentStoreState {
  status: TournamentLoadStatus;
  error: string | null;
  tournaments: Tournament[];
  load: () => Promise<void>;
  reload: () => Promise<void>;
  createTournament: (draft: TournamentDraft) => Promise<Tournament>;
  updateTournament: (id: string, patch: TournamentPatch) => Promise<Tournament>;
  deleteTournament: (id: string) => Promise<void>;
  generateFixtures: (id: string) => Promise<void>;
  advanceKnockout: (id: string, pairings: Pairing[]) => Promise<void>;
}

async function fetchTournaments(): Promise<Tournament[]> {
  const res = await fetch("/api/tournaments");
  if (!res.ok) throw new Error(`Failed to load tournaments (HTTP ${res.status})`);
  const data: { tournaments: Tournament[] } = await res.json();
  return data.tournaments ?? [];
}

export const useTournamentStore = create<TournamentStoreState>((set, get) => ({
  status: "idle",
  error: null,
  tournaments: [],

  load: async () => {
    if (get().status === "loading" || get().status === "ready") return;
    set({ status: "loading", error: null });
    try {
      set({ tournaments: await fetchTournaments(), status: "ready" });
    } catch (err) {
      set({ status: "error", error: err instanceof Error ? err.message : "Unknown error loading tournaments" });
    }
  },

  reload: async () => {
    try {
      set({ tournaments: await fetchTournaments(), status: "ready", error: null });
    } catch (err) {
      set({ status: "error", error: err instanceof Error ? err.message : "Unknown error loading tournaments" });
    }
  },

  createTournament: async (draft) => {
    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string });
      throw new Error(body.error ?? `Failed to create tournament (HTTP ${res.status})`);
    }
    const { tournament }: { tournament: Tournament } = await res.json();
    set((s) => ({ tournaments: [tournament, ...s.tournaments], status: "ready" }));
    return tournament;
  },

  updateTournament: async (id, patch) => {
    const res = await fetch(`/api/tournaments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string });
      throw new Error(body.error ?? `Failed to update tournament (HTTP ${res.status})`);
    }
    const { tournament }: { tournament: Tournament } = await res.json();
    set((s) => ({ tournaments: s.tournaments.map((t) => (t.id === tournament.id ? tournament : t)) }));
    return tournament;
  },

  deleteTournament: async (id) => {
    const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string });
      throw new Error(body.error ?? `Failed to delete tournament (HTTP ${res.status})`);
    }
    set((s) => ({ tournaments: s.tournaments.filter((t) => t.id !== id) }));
  },

  generateFixtures: async (id) => {
    const tournament = get().tournaments.find((t) => t.id === id);
    if (!tournament) throw new Error("Tournament not found.");
    const teamNames = tournament.teams.map((t) => t.name);
    const pairings: Pairing[] = tournament.format === "knockout" ? generateKnockoutFirstRound(teamNames) : generateRoundRobin(teamNames);
    const schedule = scheduleDatesForPairings(pairings, tournament.startDate);

    const { createFixture } = useFixtureStore.getState();
    for (let i = 0; i < pairings.length; i++) {
      await createFixture(buildFixtureDraftFromPairing(tournament, pairings[i], schedule[i].date, schedule[i].startTime));
    }

    await get().updateTournament(id, { fixturesGenerated: true, status: "Active" });
  },

  advanceKnockout: async (id, pairings) => {
    const tournament = get().tournaments.find((t) => t.id === id);
    if (!tournament) throw new Error("Tournament not found.");
    const schedule = scheduleDatesForPairings(pairings, new Date().toISOString().slice(0, 10));
    const { createFixture } = useFixtureStore.getState();
    for (let i = 0; i < pairings.length; i++) {
      await createFixture(buildFixtureDraftFromPairing(tournament, pairings[i], schedule[i].date, schedule[i].startTime));
    }
  },
}));
