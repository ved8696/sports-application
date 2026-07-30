// Shape of the in-progress pre-match setup wizard draft, held by
// lib/store/match-setup-store.ts for a single fixture (team selection ->
// squad -> playing XI -> captains -> toss -> match ready).

export interface TeamDraft {
  name: string;
  squad: string[];
}

export interface XIDraft {
  players: string[];
  captain: string | null;
  viceCaptain: string | null;
  wicketKeeper: string | null;
}

export interface SetupDraft {
  /** Which fixture this draft belongs to -- a mismatch against the current route's id resets the draft rather than leaking another match's selections in. */
  fixtureId: string | null;
  teamA: TeamDraft;
  teamB: TeamDraft;
  xiA: XIDraft;
  xiB: XIDraft;
  tossWinner: string | null;
  tossDecision: "bat" | "bowl" | null;
}

export function emptyTeamDraft(): TeamDraft {
  return { name: "", squad: [] };
}

export function emptyXIDraft(): XIDraft {
  return { players: [], captain: null, viceCaptain: null, wicketKeeper: null };
}

export function initialSetupDraft(fixtureId: string): SetupDraft {
  return {
    fixtureId,
    teamA: emptyTeamDraft(),
    teamB: emptyTeamDraft(),
    xiA: emptyXIDraft(),
    xiB: emptyXIDraft(),
    tossWinner: null,
    tossDecision: null,
  };
}

export const SETUP_STEPS = ["team-a", "team-b", "squad", "playing-xi", "captains", "toss", "ready"] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

export const SETUP_STEP_TITLE: Record<SetupStep, string> = {
  "team-a": "Select Team A",
  "team-b": "Select Team B",
  squad: "Squad Management",
  "playing-xi": "Playing XI",
  captains: "Captain & Wicket Keeper",
  toss: "Toss",
  ready: "Match Ready",
};

export function setupStepPath(fixtureId: string, step: SetupStep): string {
  return `/matches/${fixtureId}/setup/${step}`;
}

/** Where to (re)enter the setup flow for a fixture, based on how far it's already progressed. */
export function resumeSetupStep(fixture: { teams?: unknown; playingXI?: unknown; toss?: unknown }): SetupStep {
  if (fixture.toss) return "ready";
  if (fixture.playingXI) return "toss";
  if (fixture.teams) return "playing-xi";
  return "team-a";
}
