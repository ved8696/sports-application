// Manual field-validators, one per wizard step -- same convention as
// app/login/page.tsx: a validate*() function returns a partial errors object,
// the step page tracks `touched` per field and gates Next/Create on an empty
// errors object.

import type { MatchDraft, WizardStep } from "./types";
import { STEP_PATH, WIZARD_STEPS } from "./types";
import type { FixtureDraft } from "@/lib/cricket/fixture-types";

export type StepErrors = Partial<Record<string, string>>;

export function validateTournamentStep(draft: MatchDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.tournament.type) {
    errors.type = "Choose Friendly, League, or Tournament Match.";
  }
  if (draft.tournament.type === "tournament" && !draft.tournament.name.trim()) {
    errors.name = "Select or enter a tournament name.";
  }
  return errors;
}

export function validateDetailsStep(draft: MatchDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.name.trim()) errors.name = "Match name is required.";
  if (draft.tournament.type !== "tournament" && !draft.tournament.name.trim()) {
    errors.tournamentName = "Enter a name for this match's competition.";
  }
  if (!draft.format) errors.format = "Choose a match format.";
  if (draft.format === "Custom" && (!draft.overs || draft.overs < 1)) {
    errors.overs = "Enter the number of overs per innings.";
  }
  if (!draft.ballType) errors.ballType = "Choose a ball type.";
  if (!draft.gender) errors.gender = "Choose a gender category.";
  return errors;
}

export function validateRulesStep(draft: MatchDraft): StepErrors {
  const errors: StepErrors = {};
  const { rules, format } = draft;
  if (format !== "Test" && (!rules.oversPerInnings || rules.oversPerInnings < 1)) {
    errors.oversPerInnings = "Overs per innings must be at least 1.";
  }
  if (
    rules.powerplayOvers !== null &&
    rules.oversPerInnings !== null &&
    (rules.powerplayOvers < 1 || rules.powerplayOvers > rules.oversPerInnings)
  ) {
    errors.powerplayOvers = "Powerplay overs must be between 1 and the total overs.";
  }
  if (rules.wideRuns < 0) errors.wideRuns = "Wide run value can't be negative.";
  if (rules.noBallRuns < 0) errors.noBallRuns = "No-ball run value can't be negative.";
  return errors;
}

export function validateVenueStep(draft: MatchDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.venue.name.trim()) errors.name = "Select or add a venue.";
  return errors;
}

export function validateScheduleStep(draft: MatchDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.date) errors.date = "Match date is required.";
  if (!draft.startTime) errors.startTime = "Start time is required.";
  if (!draft.timeZone) errors.timeZone = "Time zone is required.";
  if (!draft.dayNight) errors.dayNight = "Choose Day, Night, or Day/Night.";
  return errors;
}

/** Full-draft check used to guard direct/refreshed URLs into later steps and to gate the final Create action. */
export function draftReadyForReview(draft: MatchDraft): boolean {
  return firstIncompleteStepPath(draft) === null;
}

/** First step (by path) whose fields aren't valid yet, or null if the draft is complete. Used to bounce a direct/refreshed URL back to where it needs to start. */
export function firstIncompleteStepPath(draft: MatchDraft): string | null {
  if (Object.keys(validateTournamentStep(draft)).length > 0) return STEP_PATH.tournament;
  if (Object.keys(validateDetailsStep(draft)).length > 0) return STEP_PATH.details;
  if (Object.keys(validateRulesStep(draft)).length > 0) return STEP_PATH.rules;
  if (Object.keys(validateVenueStep(draft)).length > 0) return STEP_PATH.venue;
  if (Object.keys(validateScheduleStep(draft)).length > 0) return STEP_PATH.schedule;
  return null;
}

const STEP_VALIDATORS: Record<WizardStep, (draft: MatchDraft) => StepErrors> = {
  tournament: validateTournamentStep,
  details: validateDetailsStep,
  rules: validateRulesStep,
  venue: validateVenueStep,
  schedule: validateScheduleStep,
  review: () => ({}),
};

/**
 * Guards a step page against a direct/refreshed URL for a step whose
 * prerequisites aren't filled in yet -- returns the path of the earliest
 * prior step still missing required fields, or null if it's safe to render.
 */
export function guardRedirect(draft: MatchDraft, step: WizardStep): string | null {
  const index = WIZARD_STEPS.indexOf(step);
  for (let i = 0; i < index; i++) {
    const priorStep = WIZARD_STEPS[i];
    if (Object.keys(STEP_VALIDATORS[priorStep](draft)).length > 0) return STEP_PATH[priorStep];
  }
  return null;
}

/** Converts a fully-valid draft into the payload POSTed to /api/fixtures. Only call once draftReadyForReview(draft) is true. */
export function toFixtureDraft(draft: MatchDraft): FixtureDraft {
  return {
    name: draft.name.trim(),
    tournament: { type: draft.tournament.type as NonNullable<MatchDraft["tournament"]["type"]>, name: draft.tournament.name.trim() },
    format: draft.format as string,
    overs: draft.overs,
    ballType: draft.ballType as NonNullable<MatchDraft["ballType"]>,
    gender: draft.gender as NonNullable<MatchDraft["gender"]>,
    ageGroup: draft.ageGroup,
    matchType: draft.matchType,
    venue: { name: draft.venue.name.trim(), city: draft.venue.city.trim() || undefined },
    date: draft.date,
    startTime: draft.startTime,
    timeZone: draft.timeZone,
    dayNight: draft.dayNight as NonNullable<MatchDraft["dayNight"]>,
    rules: draft.rules,
  };
}
