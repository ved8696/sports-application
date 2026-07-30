// Pre-ball guards -- what the scoring UI checks before it lets a delivery
// through, and what the engine double-checks defensively.

import type { InningsState, WicketDetail } from "./types";
import { isAllowedOnFreeHit } from "./wickets";

export interface BallValidationError {
  message: string;
}

export function validateReadyToScore(innings: InningsState): BallValidationError | null {
  if (!innings.strikerName || !innings.nonStrikerName) return { message: "Select both batters before scoring." };
  if (!innings.currentBowlerName) return { message: "Select a bowler before scoring." };
  return null;
}

export function validateWicket(innings: InningsState, wicket: WicketDetail): BallValidationError | null {
  if (innings.isFreeHit && !isAllowedOnFreeHit(wicket.type)) {
    return { message: "Only a run out can end a free hit." };
  }
  if (wicket.playerOut !== innings.strikerName && wicket.playerOut !== innings.nonStrikerName) {
    return { message: "The dismissed player must be one of the two batters at the crease." };
  }
  return null;
}

export function validateNewBowler(innings: InningsState, name: string): BallValidationError | null {
  if (name === innings.previousOverBowlerName) return { message: "The same bowler can't bowl consecutive overs." };
  return null;
}
