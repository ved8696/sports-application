"use client";

// Holds the in-progress tournament-creation wizard draft above route level --
// same reasoning and same persist-middleware pattern as
// lib/store/match-creation-store.ts, so navigating back/forth between
// /tournaments/new/* steps or a full reload mid-wizard never loses data.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { initialTournamentDraft, type TournamentDraft, type TournamentTeam } from "@/lib/tournament/types";

interface TournamentCreationState {
  draft: TournamentDraft;
  updateDraft: (patch: Partial<TournamentDraft>) => void;
  updateRules: (patch: Partial<TournamentDraft["rules"]>) => void;
  adjustTeamCount: (delta: number) => void;
  toggleTeam: (name: string) => void;
  addNewTeam: (name: string) => void;
  reset: () => void;
}

export const useTournamentCreationStore = create<TournamentCreationState>()(
  persist(
    (set) => ({
      draft: initialTournamentDraft(),

      updateDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),

      updateRules: (patch) => set((s) => ({ draft: { ...s.draft, rules: { ...s.draft.rules, ...patch } } })),

      // Reads the current count from the functional updater's state, not the
      // component's render-time closure -- rapid taps otherwise reuse the
      // same stale draft.numberOfTeams across multiple queued clicks and
      // only end up decrementing/incrementing once.
      adjustTeamCount: (delta) =>
        set((s) => ({ draft: { ...s.draft, numberOfTeams: Math.max(2, Math.min(32, s.draft.numberOfTeams + delta)) } })),

      toggleTeam: (name) =>
        set((s) => {
          const exists = s.draft.teams.some((t) => t.name === name);
          const teams: TournamentTeam[] = exists
            ? s.draft.teams.filter((t) => t.name !== name)
            : [...s.draft.teams, { name, captain: null, wicketKeeper: null, squad: [] }];
          return { draft: { ...s.draft, teams } };
        }),

      addNewTeam: (name) =>
        set((s) => {
          const trimmed = name.trim();
          if (!trimmed || s.draft.teams.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) return s;
          return { draft: { ...s.draft, teams: [...s.draft.teams, { name: trimmed, captain: null, wicketKeeper: null, squad: [] }] } };
        }),

      reset: () => set({ draft: initialTournamentDraft() }),
    }),
    {
      name: "willow-tournament-draft",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
