"use client";

// Holds the in-progress pre-match setup draft (teams -> squad -> playing XI ->
// captains -> toss) for a single fixture, mirroring lib/store/match-creation-store.ts.
// Persisted to sessionStorage so back-navigation and reloads mid-setup never
// lose data. Keyed by fixtureId: switching to a different match's setup flow
// resets the draft instead of leaking one match's selections into another's.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { initialSetupDraft, type OpenersDraft, type SetupDraft, type TeamDraft, type XIDraft } from "@/lib/matchSetup/types";
import type { Fixture } from "@/lib/cricket/fixture-types";

interface MatchSetupState {
  draft: SetupDraft;
  hydrateFromFixture: (fixture: Fixture) => void;
  setTeamA: (team: Partial<TeamDraft>) => void;
  setTeamB: (team: Partial<TeamDraft>) => void;
  setXIA: (xi: Partial<XIDraft>) => void;
  setXIB: (xi: Partial<XIDraft>) => void;
  setToss: (winner: string | null, decision: "bat" | "bowl" | null) => void;
  setOpeners: (openers: Partial<OpenersDraft>) => void;
  reset: (fixtureId: string) => void;
}

function draftFromFixture(fixture: Fixture): SetupDraft {
  const draft = initialSetupDraft(fixture.id);
  if (fixture.teams) {
    draft.teamA = { name: fixture.teams[0].name, squad: fixture.teams[0].squad };
    draft.teamB = { name: fixture.teams[1].name, squad: fixture.teams[1].squad };
  }
  if (fixture.playingXI) {
    const [a, b] = fixture.playingXI;
    draft.xiA = { players: a.players, captain: a.captain, viceCaptain: a.viceCaptain ?? null, wicketKeeper: a.wicketKeeper };
    draft.xiB = { players: b.players, captain: b.captain, viceCaptain: b.viceCaptain ?? null, wicketKeeper: b.wicketKeeper };
  }
  if (fixture.toss) {
    draft.tossWinner = fixture.toss.winner;
    draft.tossDecision = fixture.toss.decision;
  }
  return draft;
}

export const useMatchSetupStore = create<MatchSetupState>()(
  persist(
    (set, get) => ({
      draft: initialSetupDraft(""),

      // Only pulls server state in when this is a fresh session for the
      // fixture -- an in-progress local draft for the same match is never
      // clobbered by a stale server snapshot.
      hydrateFromFixture: (fixture) => {
        if (get().draft.fixtureId !== fixture.id) set({ draft: draftFromFixture(fixture) });
      },

      setTeamA: (team) => set((s) => ({ draft: { ...s.draft, teamA: { ...s.draft.teamA, ...team } } })),
      setTeamB: (team) => set((s) => ({ draft: { ...s.draft, teamB: { ...s.draft.teamB, ...team } } })),
      setXIA: (xi) => set((s) => ({ draft: { ...s.draft, xiA: { ...s.draft.xiA, ...xi } } })),
      setXIB: (xi) => set((s) => ({ draft: { ...s.draft, xiB: { ...s.draft.xiB, ...xi } } })),
      setToss: (winner, decision) => set((s) => ({ draft: { ...s.draft, tossWinner: winner, tossDecision: decision } })),
      setOpeners: (openers) => set((s) => ({ draft: { ...s.draft, openers: { ...s.draft.openers, ...openers } } })),
      reset: (fixtureId) => set({ draft: initialSetupDraft(fixtureId) }),
    }),
    {
      name: "willow-match-setup",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
