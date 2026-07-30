// Tournament domain model. A Tournament owns a set of team names/squads and a
// format/rules configuration; the matches it schedules are ordinary
// lib/cricket/fixture-types.ts Fixtures (tagged with tournamentId + round),
// so the entire existing match lifecycle -- pre-match setup wizard, live
// scoring, scorecard, archiving into /data -- is reused completely unchanged.
// Standings/analytics are then computed by reading those same Fixtures plus
// the archived Match history, never a parallel data path.

import type { FixtureRules } from "@/lib/cricket/fixture-types";

export type TournamentFormat = "league" | "knockout" | "league+playoffs";
export type TournamentStatus = "Draft" | "Active" | "Completed";
export type TournamentVisibility = "Public" | "Private";

export const TOURNAMENT_FORMAT_LABEL: Record<TournamentFormat, string> = {
  "league+playoffs": "League + Playoffs",
  knockout: "Knockout",
  league: "League Only",
};

export const TOURNAMENT_FORMAT_DESCRIPTION: Record<TournamentFormat, string> = {
  "league+playoffs": "Round robin, then top teams advance",
  knockout: "Single elimination bracket",
  league: "Round robin, points table decides winner",
};

export interface TournamentTeam {
  name: string;
  captain: string | null;
  wicketKeeper: string | null;
  squad: string[];
}

/** Tournament-level rules -- a small, tournament-appropriate subset of the full FixtureRules the per-match setup wizard uses; applied as defaults to every generated fixture. */
export interface TournamentRules {
  oversPerInnings: number;
  powerplayOvers: number | null;
  drs: boolean;
  superOver: boolean;
  dls: boolean;
}

export function tournamentRulesToFixtureRules(rules: TournamentRules): FixtureRules {
  return {
    oversPerInnings: rules.oversPerInnings,
    powerplayOvers: rules.powerplayOvers,
    superOver: rules.superOver,
    dls: rules.dls,
    wideRuns: 1,
    noBallRuns: 1,
    freeHit: true,
    retirement: "retired-out",
  };
}

export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  status: TournamentStatus;
  visibility: TournamentVisibility;
  archived: boolean;
  startDate: string;
  endDate: string;
  description: string;
  format: TournamentFormat;
  numberOfTeams: number;
  rules: TournamentRules;
  teams: TournamentTeam[];
  /** Set once fixtures have been generated -- gates re-generation and unlocks the Fixtures/Table/Stats tabs. */
  fixturesGenerated: boolean;
}

export type TournamentDraft = Omit<Tournament, "id" | "createdAt" | "status" | "archived" | "fixturesGenerated">;
export type TournamentPatch = Partial<Omit<Tournament, "id" | "createdAt">>;

export const WIZARD_STEPS = ["info", "format", "rules", "teams", "review"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export const STEP_TITLE: Record<WizardStep, string> = {
  info: "Tournament Information",
  format: "Tournament Format",
  rules: "Rules",
  teams: "Team Selection",
  review: "Review",
};

export function initialTournamentDraft(): TournamentDraft {
  return {
    name: "",
    visibility: "Public",
    startDate: "",
    endDate: "",
    description: "",
    format: "league+playoffs",
    numberOfTeams: 8,
    rules: { oversPerInnings: 20, powerplayOvers: 6, drs: true, superOver: true, dls: false },
    teams: [],
  };
}
