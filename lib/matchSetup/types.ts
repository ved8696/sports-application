// Shape of the in-progress pre-match setup wizard draft, held by
// lib/store/match-setup-store.ts for a single fixture (team selection ->
// squad + playing XI + captains -> toss -> opening players -> match ready).

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

export interface OpenersDraft {
  striker: string | null;
  nonStriker: string | null;
  bowler: string | null;
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
  openers: OpenersDraft;
}

export function emptyTeamDraft(): TeamDraft {
  return { name: "", squad: [] };
}

export function emptyXIDraft(): XIDraft {
  return { players: [], captain: null, viceCaptain: null, wicketKeeper: null };
}

export function emptyOpenersDraft(): OpenersDraft {
  return { striker: null, nonStriker: null, bowler: null };
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
    openers: emptyOpenersDraft(),
  };
}

// Squad, Playing XI and Captain/VC/WK selection live on one combined screen
// (matches the imported wireframe's single "Squad" step) instead of three
// separate pages -- picking a Playing XI member and tagging C/VC/WK all
// happen inline on the same squad list.
export const SETUP_STEPS = ["team-a", "team-b", "squad", "toss", "openers", "ready"] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

export const SETUP_STEP_TITLE: Record<SetupStep, string> = {
  "team-a": "Select Team A",
  "team-b": "Select Team B",
  squad: "Squad & Playing XI",
  toss: "Toss",
  openers: "Opening Players",
  ready: "Match Ready",
};

export function setupStepPath(fixtureId: string, step: SetupStep): string {
  return `/matches/${fixtureId}/setup/${step}`;
}

/** Also used by lib/matchSetup/validation.ts's squad/playing-XI validators -- defined here so resumeSetupStep below can check the same threshold without a circular import. */
export const MIN_SQUAD_SIZE = 11;

/**
 * Where to (re)enter the setup flow for a fixture, based on how far it's
 * already progressed server-side. Opening players aren't persisted on the
 * Fixture itself (they're only needed transiently to launch live scoring),
 * so once a toss is recorded the furthest we can resume to is "openers" --
 * guardRedirect (lib/matchSetup/validation.ts) takes over from there using
 * the local draft to decide whether "ready" is actually reachable.
 */
export function resumeSetupStep(fixture: { teams?: unknown; playingXI?: unknown; toss?: unknown }): SetupStep {
  if (fixture.toss) return "openers";
  if (fixture.playingXI) return "toss";
  if (fixture.teams) return "squad";
  return "team-a";
}
