// Bowler Manager: creates and updates individual bowling figures.

import type { BowlerInningsStats } from "./types";
import { oversLabel } from "./overs";

export function createBowler(name: string): BowlerInningsStats {
  return { name, legalBalls: 0, runsConceded: 0, wickets: 0, maidens: 0, economy: 0, oversLabel: "0.0" };
}

export function applyBallToBowler(
  bowler: BowlerInningsStats,
  isLegal: boolean,
  bowlerRuns: number,
  tookWicket: boolean
): BowlerInningsStats {
  const legalBalls = bowler.legalBalls + (isLegal ? 1 : 0);
  const runsConceded = bowler.runsConceded + bowlerRuns;
  const overs = legalBalls / 6;
  return {
    ...bowler,
    legalBalls,
    runsConceded,
    wickets: bowler.wickets + (tookWicket ? 1 : 0),
    economy: overs > 0 ? Number((runsConceded / overs).toFixed(2)) : 0,
    oversLabel: oversLabel(legalBalls),
  };
}

export function applyMaiden(bowler: BowlerInningsStats): BowlerInningsStats {
  return { ...bowler, maidens: bowler.maidens + 1 };
}
