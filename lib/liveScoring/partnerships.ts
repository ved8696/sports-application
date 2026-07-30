// Partnership tracking -- the last entry in InningsState.partnerships is
// always the active one; a wicket closes it and the engine opens a new one
// once the replacement batter is in.

import type { Partnership } from "./types";

export function newPartnership(batterA: string, batterB: string, startOverLabel: string): Partnership {
  return { batterA, batterB, runs: 0, balls: 0, startOverLabel, active: true };
}

export function applyBallToPartnership(partnership: Partnership, totalRuns: number, isLegal: boolean): Partnership {
  return { ...partnership, runs: partnership.runs + totalRuns, balls: partnership.balls + (isLegal ? 1 : 0) };
}

export function closePartnership(partnership: Partnership): Partnership {
  return { ...partnership, active: false };
}
