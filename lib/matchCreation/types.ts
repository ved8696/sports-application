// Shape of the in-progress wizard draft held by lib/store/match-creation-store.ts.
// Mirrors Fixture (lib/cricket/fixture-types.ts) field-for-field but keeps every
// field optional/blank-friendly since the draft is built up one step at a time.

import { defaultRulesForFormat } from "./defaults";
import type { BallType, DayNight, FixtureCreationType, FixtureRules } from "@/lib/cricket/fixture-types";
import type { Gender } from "@/lib/cricket/types";

export interface MatchDraft {
  tournament: { type: FixtureCreationType | null; name: string };
  name: string;
  format: string | null;
  overs: number | null;
  ballType: BallType | null;
  gender: Gender | null;
  ageGroup: string;
  matchType: string;
  venue: { name: string; city: string };
  date: string;
  startTime: string;
  timeZone: string;
  dayNight: DayNight | null;
  rules: FixtureRules;
}

export function initialMatchDraft(): MatchDraft {
  return {
    tournament: { type: null, name: "" },
    name: "",
    format: null,
    overs: null,
    ballType: null,
    gender: null,
    ageGroup: "Open",
    matchType: "League Stage",
    venue: { name: "", city: "" },
    date: "",
    startTime: "",
    timeZone: "",
    dayNight: null,
    rules: defaultRulesForFormat("T20", 20),
  };
}

export const WIZARD_STEPS = ["tournament", "details", "rules", "venue", "schedule", "review"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export const STEP_PATH: Record<WizardStep, string> = {
  tournament: "/matches/new",
  details: "/matches/new/details",
  rules: "/matches/new/rules",
  venue: "/matches/new/venue",
  schedule: "/matches/new/schedule",
  review: "/matches/new/review",
};

export const STEP_TITLE: Record<WizardStep, string> = {
  tournament: "Select Tournament",
  details: "Match Details",
  rules: "Competition Rules",
  venue: "Venue",
  schedule: "Date & Time",
  review: "Review Match",
};
