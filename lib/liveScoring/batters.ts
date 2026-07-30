// Batter Manager: creates and updates individual batting figures. Pure
// state-transition functions -- lib/liveScoring/engine.ts decides *when* to
// call these, this module only knows *how* a batter's line updates.

import type { BatterInningsStats, WicketDetail } from "./types";

export function createBatter(name: string, battingOrder: number): BatterInningsStats {
  return {
    name,
    battingOrder,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
    isRetired: false,
    dismissal: null,
    strikeRate: 0,
  };
}

/** `creditedRuns` is the batting-runs equivalent for this ball -- 0 for byes/leg-byes/wides, runsBat otherwise. */
export function applyBallToBatter(batter: BatterInningsStats, creditedRuns: number, isLegal: boolean): BatterInningsStats {
  const runs = batter.runs + creditedRuns;
  const balls = batter.balls + (isLegal ? 1 : 0);
  return {
    ...batter,
    runs,
    balls,
    fours: batter.fours + (creditedRuns === 4 ? 1 : 0),
    sixes: batter.sixes + (creditedRuns === 6 ? 1 : 0),
    strikeRate: balls > 0 ? Number(((runs / balls) * 100).toFixed(1)) : 0,
  };
}

export function dismissBatter(batter: BatterInningsStats, wicket: WicketDetail): BatterInningsStats {
  return { ...batter, isOut: true, dismissal: wicket };
}

export function retireBatter(batter: BatterInningsStats, out: boolean): BatterInningsStats {
  return { ...batter, isRetired: true, isOut: out };
}
