// Innings End Detection -- checked after every ball by the store. All-out
// assumes the standard 11-a-side XI already enforced during Sprint 3's
// Playing XI step (10 wickets down = no partner left), so no XI-size lookup
// is needed here.

import type { InningsEndReason, InningsState } from "./types";

export const WICKETS_FOR_ALL_OUT = 10;

export interface InningsEndCheck {
  ended: boolean;
  reason: InningsEndReason | null;
}

export function checkInningsEnd(innings: InningsState, oversLimit: number | null, target: number | null): InningsEndCheck {
  if (innings.totalWickets >= WICKETS_FOR_ALL_OUT) return { ended: true, reason: "all-out" };
  if (oversLimit !== null && innings.legalBalls >= oversLimit * 6) return { ended: true, reason: "overs-completed" };
  // Second innings ends the moment the chasing side passes the target -- no need to bowl out the over.
  if (target !== null && innings.totalRuns >= target) return { ended: true, reason: "target-reached" };
  return { ended: false, reason: null };
}
