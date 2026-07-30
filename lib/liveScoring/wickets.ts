// Wicket Engine: rules for how each dismissal type is credited and validated.
// Pure lookups only -- lib/liveScoring/engine.ts applies the actual state change.

import { BOWLER_CREDITED_WICKETS, DELIVERY_WICKETS, type WicketType } from "./types";

export function bowlerCredited(type: WicketType): boolean {
  return BOWLER_CREDITED_WICKETS.has(type);
}

export function requiresFielder(type: WicketType): boolean {
  return type === "caught" || type === "run-out" || type === "stumped";
}

/** Whether this dismissal is tied to a specific delivery (vs. a standalone declaration like timed out). */
export function isDeliveryWicket(type: WicketType): boolean {
  return DELIVERY_WICKETS.has(type);
}

/** Free-hit protection: only a run out can end a batter's innings off a free-hit delivery. */
export function isAllowedOnFreeHit(type: WicketType): boolean {
  return type === "run-out" || !isDeliveryWicket(type);
}

export const WICKET_LABELS: Record<WicketType, string> = {
  bowled: "Bowled",
  caught: "Caught",
  lbw: "LBW",
  "run-out": "Run Out",
  stumped: "Stumped",
  "hit-wicket": "Hit Wicket",
  "retired-hurt": "Retired Hurt",
  "retired-out": "Retired Out",
  "timed-out": "Timed Out",
  "obstructing-field": "Obstructing the Field",
};

export const WICKET_TYPES: WicketType[] = [
  "bowled",
  "caught",
  "lbw",
  "run-out",
  "stumped",
  "hit-wicket",
  "retired-hurt",
  "retired-out",
  "timed-out",
  "obstructing-field",
];
