// Manual field-validators, one per wizard step -- same convention as
// lib/matchCreation/validation.ts: a validate*() returns a partial errors
// object, each step page tracks `touched` and gates Continue on an empty
// errors object.

import type { TournamentDraft, WizardStep } from "./types";
import { WIZARD_STEPS } from "./types";

export type StepErrors = Partial<Record<string, string>>;

export const STEP_PATH: Record<WizardStep, string> = {
  info: "/tournaments/new",
  format: "/tournaments/new/format",
  rules: "/tournaments/new/rules",
  teams: "/tournaments/new/teams",
  review: "/tournaments/new/review",
};

export function validateInfoStep(draft: TournamentDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.name.trim()) errors.name = "Tournament name is required.";
  if (!draft.startDate) errors.startDate = "Start date is required.";
  if (!draft.endDate) errors.endDate = "End date is required.";
  if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
    errors.endDate = "End date can't be before the start date.";
  }
  return errors;
}

export function validateFormatStep(draft: TournamentDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.format) errors.format = "Choose a tournament format.";
  if (draft.numberOfTeams < 2) errors.numberOfTeams = "At least 2 teams are required.";
  if (draft.format === "knockout" && (draft.numberOfTeams & (draft.numberOfTeams - 1)) !== 0) {
    errors.numberOfTeams = "Knockout tournaments need a power-of-two team count (2, 4, 8, 16…).";
  }
  return errors;
}

export function validateRulesStep(draft: TournamentDraft): StepErrors {
  const errors: StepErrors = {};
  if (draft.rules.oversPerInnings < 1) errors.oversPerInnings = "Overs per innings must be at least 1.";
  if (draft.rules.powerplayOvers !== null && draft.rules.powerplayOvers > draft.rules.oversPerInnings) {
    errors.powerplayOvers = "Powerplay overs can't exceed the total overs.";
  }
  return errors;
}

export const MIN_TOURNAMENT_TEAMS = 2;
export const MAX_TOURNAMENT_TEAMS = 32;

export function validateTeamsStep(draft: TournamentDraft): StepErrors {
  const errors: StepErrors = {};
  const names = draft.teams.map((t) => t.name.trim().toLowerCase());
  if (draft.teams.length < MIN_TOURNAMENT_TEAMS) errors.teams = `Select at least ${MIN_TOURNAMENT_TEAMS} teams.`;
  else if (draft.teams.length > MAX_TOURNAMENT_TEAMS) errors.teams = `No more than ${MAX_TOURNAMENT_TEAMS} teams.`;
  else if (draft.teams.length !== draft.numberOfTeams) errors.teams = `Select exactly ${draft.numberOfTeams} teams (${draft.teams.length} selected).`;
  if (new Set(names).size !== names.length) errors.teams = "Duplicate team names aren't allowed.";
  return errors;
}

const STEP_VALIDATORS: Record<WizardStep, (draft: TournamentDraft) => StepErrors> = {
  info: validateInfoStep,
  format: validateFormatStep,
  rules: validateRulesStep,
  teams: validateTeamsStep,
  review: () => ({}),
};

/** Redirects a direct/refreshed URL back to the earliest step still missing required fields. */
export function guardRedirect(draft: TournamentDraft, step: WizardStep): string | null {
  const index = WIZARD_STEPS.indexOf(step);
  for (let i = 0; i < index; i++) {
    const priorStep = WIZARD_STEPS[i];
    if (Object.keys(STEP_VALIDATORS[priorStep](draft)).length > 0) return STEP_PATH[priorStep];
  }
  return null;
}

export function draftReadyForReview(draft: TournamentDraft): boolean {
  return WIZARD_STEPS.filter((s) => s !== "review").every((s) => Object.keys(STEP_VALIDATORS[s](draft)).length === 0);
}
