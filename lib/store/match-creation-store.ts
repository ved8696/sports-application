"use client";

// Holds the in-progress match-creation wizard draft above route level, so
// navigating back and forth between /matches/new/* steps -- or a full page
// reload mid-wizard -- never loses what's been entered. Persisted to
// sessionStorage via zustand's built-in persist middleware (no new dependency).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { initialMatchDraft, type MatchDraft } from "@/lib/matchCreation/types";
import { defaultOversForFormat, defaultRulesForFormat } from "@/lib/matchCreation/defaults";

interface MatchCreationState {
  draft: MatchDraft;
  updateDraft: (patch: Partial<MatchDraft>) => void;
  updateRules: (patch: Partial<MatchDraft["rules"]>) => void;
  setFormat: (format: string) => void;
  reset: () => void;
}

export const useMatchCreationStore = create<MatchCreationState>()(
  persist(
    (set) => ({
      draft: initialMatchDraft(),

      updateDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),

      updateRules: (patch) => set((s) => ({ draft: { ...s.draft, rules: { ...s.draft.rules, ...patch } } })),

      // Format drives the overs default and which rules apply (powerplay,
      // Super Over, DLS, Free Hit) -- re-derive both whenever it changes.
      setFormat: (format) =>
        set((s) => {
          const overs = format === "Custom" ? s.draft.overs : defaultOversForFormat(format);
          return { draft: { ...s.draft, format, overs, rules: defaultRulesForFormat(format, overs) } };
        }),

      reset: () => set({ draft: initialMatchDraft() }),
    }),
    {
      name: "willow-match-draft",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
