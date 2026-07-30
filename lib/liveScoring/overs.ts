// Over Manager: legal-ball counting and over-completion helpers shared by
// the engine, the scoreboard, and the UI's over-progress strip.

import type { BallEvent } from "./types";

export const LEGAL_BALLS_PER_OVER = 6;

export function legalBallsInOver(events: BallEvent[]): number {
  return events.filter((e) => e.isLegal).length;
}

export function isOverComplete(events: BallEvent[]): boolean {
  return legalBallsInOver(events) >= LEGAL_BALLS_PER_OVER;
}

export function nextBallInOver(events: BallEvent[]): number {
  return legalBallsInOver(events) + 1;
}

/** "3.4" style over/ball display from a legal-ball count. */
export function oversLabel(legalBalls: number): string {
  const overs = Math.floor(legalBalls / LEGAL_BALLS_PER_OVER);
  const balls = legalBalls % LEGAL_BALLS_PER_OVER;
  return `${overs}.${balls}`;
}

export function currentRunRate(totalRuns: number, legalBalls: number): number {
  if (legalBalls === 0) return 0;
  return Number(((totalRuns / legalBalls) * LEGAL_BALLS_PER_OVER).toFixed(2));
}
