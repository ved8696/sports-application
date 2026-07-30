// Target Calculation -- the second innings' chase state. Format-agnostic:
// works identically for limited-overs (T10/T20/ODI) and unlimited-overs
// formats (oversLimit === null just means ballsRemaining/RRR read as
// "unlimited" instead of a countdown).

import type { ChaseState, InningsState } from "./types";
import { oversLabel } from "./overs";

export function computeTarget(firstInningsRuns: number): number {
  return firstInningsRuns + 1;
}

export function computeChase(target: number, secondInnings: InningsState, oversLimit: number | null): ChaseState {
  const runsRequired = Math.max(target - secondInnings.totalRuns, 0);
  const ballsBowled = secondInnings.legalBalls;
  const totalBalls = oversLimit !== null ? oversLimit * 6 : null;
  const ballsRemaining = totalBalls !== null ? Math.max(totalBalls - ballsBowled, 0) : null;
  const requiredRunRate = ballsRemaining !== null && ballsRemaining > 0 ? Number(((runsRequired / ballsRemaining) * 6).toFixed(2)) : null;

  return {
    target,
    runsRequired,
    ballsRemaining,
    oversRemainingLabel: totalBalls !== null ? oversLabel(totalBalls - ballsBowled) : null,
    requiredRunRate,
    isWon: secondInnings.totalRuns >= target,
  };
}
