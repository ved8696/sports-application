// Manual field-validators for the pre-match setup wizard, one per step --
// same convention as lib/matchCreation/validation.ts and app/login/page.tsx.

import type { SetupDraft, SetupStep, TeamDraft, XIDraft } from "./types";
import { MIN_SQUAD_SIZE, SETUP_STEPS, setupStepPath } from "./types";
import type { FixturePlayingXI, FixtureTeam, FixtureToss } from "@/lib/cricket/fixture-types";

export type StepErrors = Partial<Record<string, string>>;

export { MIN_SQUAD_SIZE };
export const PLAYING_XI_SIZE = 11;

export function validateTeamAStep(draft: SetupDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.teamA.name.trim()) errors.name = "Select or enter Team A.";
  return errors;
}

export function validateTeamBStep(draft: SetupDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.teamB.name.trim()) errors.name = "Select or enter Team B.";
  else if (draft.teamB.name.trim().toLowerCase() === draft.teamA.name.trim().toLowerCase()) {
    errors.name = "Team B must be different from Team A.";
  }
  return errors;
}

function squadErrors(team: TeamDraft, label: string): string | undefined {
  if (team.squad.length < MIN_SQUAD_SIZE) {
    return `${label} needs at least ${MIN_SQUAD_SIZE} players (${team.squad.length} added).`;
  }
  return undefined;
}

export function validateSquadStep(draft: SetupDraft): StepErrors {
  const errors: StepErrors = {};
  const a = squadErrors(draft.teamA, draft.teamA.name || "Team A");
  const b = squadErrors(draft.teamB, draft.teamB.name || "Team B");
  if (a) errors.teamA = a;
  if (b) errors.teamB = b;
  return errors;
}

function xiErrors(xi: XIDraft, squad: TeamDraft, label: string): string | undefined {
  if (xi.players.length !== PLAYING_XI_SIZE) {
    return `${label} needs exactly ${PLAYING_XI_SIZE} players (${xi.players.length} selected).`;
  }
  if (!xi.players.every((p) => squad.squad.includes(p))) {
    return `${label}'s Playing XI must be chosen from its squad.`;
  }
  return undefined;
}

export function validatePlayingXIStep(draft: SetupDraft): StepErrors {
  const errors: StepErrors = {};
  const a = xiErrors(draft.xiA, draft.teamA, draft.teamA.name || "Team A");
  const b = xiErrors(draft.xiB, draft.teamB, draft.teamB.name || "Team B");
  if (a) errors.xiA = a;
  if (b) errors.xiB = b;
  return errors;
}

function captainErrors(xi: XIDraft, label: string): string | undefined {
  if (!xi.captain) return `Choose a captain for ${label}.`;
  if (!xi.players.includes(xi.captain)) return `${label}'s captain must be in the Playing XI.`;
  if (!xi.wicketKeeper) return `Choose a wicket keeper for ${label}.`;
  if (!xi.players.includes(xi.wicketKeeper)) return `${label}'s wicket keeper must be in the Playing XI.`;
  if (xi.viceCaptain) {
    if (!xi.players.includes(xi.viceCaptain)) return `${label}'s vice captain must be in the Playing XI.`;
    if (xi.viceCaptain === xi.captain) return `${label}'s vice captain must differ from the captain.`;
  }
  return undefined;
}

export function validateCaptainsStep(draft: SetupDraft): StepErrors {
  const errors: StepErrors = {};
  const a = captainErrors(draft.xiA, draft.teamA.name || "Team A");
  const b = captainErrors(draft.xiB, draft.teamB.name || "Team B");
  if (a) errors.xiA = a;
  if (b) errors.xiB = b;
  return errors;
}

export function validateTossStep(draft: SetupDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.tossWinner) errors.tossWinner = "Select the toss-winning team.";
  else if (draft.tossWinner !== draft.teamA.name && draft.tossWinner !== draft.teamB.name) {
    errors.tossWinner = "Toss winner must be one of the two selected teams.";
  }
  if (!draft.tossDecision) errors.tossDecision = "Choose to Bat or Bowl.";
  return errors;
}

const STEP_VALIDATORS: Record<SetupStep, (draft: SetupDraft) => StepErrors> = {
  "team-a": validateTeamAStep,
  "team-b": validateTeamBStep,
  squad: validateSquadStep,
  "playing-xi": validatePlayingXIStep,
  captains: validateCaptainsStep,
  toss: validateTossStep,
  ready: () => ({}),
};

/** Guards a step page against a direct/refreshed URL for a step whose prerequisites aren't filled in yet. */
export function guardRedirect(fixtureId: string, draft: SetupDraft, step: SetupStep): string | null {
  const index = SETUP_STEPS.indexOf(step);
  for (let i = 0; i < index; i++) {
    const priorStep = SETUP_STEPS[i];
    if (Object.keys(STEP_VALIDATORS[priorStep](draft)).length > 0) return setupStepPath(fixtureId, priorStep);
  }
  return null;
}

export function setupComplete(draft: SetupDraft): boolean {
  return guardRedirectFromEnd(draft) === null;
}

function guardRedirectFromEnd(draft: SetupDraft): string | null {
  for (const step of SETUP_STEPS) {
    if (step === "ready") continue;
    if (Object.keys(STEP_VALIDATORS[step](draft)).length > 0) return step;
  }
  return null;
}

export function toFixtureTeams(draft: SetupDraft): [FixtureTeam, FixtureTeam] {
  return [
    { name: draft.teamA.name.trim(), squad: draft.teamA.squad },
    { name: draft.teamB.name.trim(), squad: draft.teamB.squad },
  ];
}

function toFixtureXI(team: TeamDraft, xi: XIDraft): FixturePlayingXI {
  return {
    team: team.name.trim(),
    players: xi.players,
    captain: xi.captain as string,
    viceCaptain: xi.viceCaptain ?? undefined,
    wicketKeeper: xi.wicketKeeper as string,
  };
}

export function toFixturePlayingXI(draft: SetupDraft): [FixturePlayingXI, FixturePlayingXI] {
  return [toFixtureXI(draft.teamA, draft.xiA), toFixtureXI(draft.teamB, draft.xiB)];
}

export function toFixtureToss(draft: SetupDraft): FixtureToss {
  return { winner: draft.tossWinner as string, decision: draft.tossDecision as "bat" | "bowl" };
}
