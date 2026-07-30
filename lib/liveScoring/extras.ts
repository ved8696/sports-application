// Extras Engine: turns a raw ball input into the runs breakdown every other
// module needs -- what's added to the team total, what's credited to the
// batter, what's charged against the bowler, and how many runs were
// physically run (which drives strike rotation). Pure, no state.

import type { BallInput, ExtraType } from "./types";

export interface ExtraComputation {
  isLegal: boolean;
  totalRuns: number; // added to the team score
  batterRuns: number; // credited to the striker's individual tally
  bowlerRuns: number; // charged against the bowler's figures
  battersRun: number; // runs physically run between the wickets -- drives strike rotation
}

export function computeExtras(input: Pick<BallInput, "runsBat" | "extra" | "extraRuns">): ExtraComputation {
  const { runsBat, extra, extraRuns } = input;

  switch (extra) {
    case "wide":
      // Illegal delivery. The mandatory 1 plus anything run while the ball
      // was live are extras -- never credited to the batter, but charged
      // fully against the bowler.
      return { isLegal: false, totalRuns: 1 + extraRuns, batterRuns: 0, bowlerRuns: 1 + extraRuns, battersRun: extraRuns };
    case "no-ball":
      // Illegal delivery, but the batter can still score off it -- both the
      // penalty and anything hit are charged to the bowler.
      return { isLegal: false, totalRuns: 1 + runsBat, batterRuns: runsBat, bowlerRuns: 1 + runsBat, battersRun: runsBat };
    case "bye":
    case "leg-bye":
      // Legal delivery the batter didn't put bat on -- runs go to the team,
      // never to the batter or against the bowler's figures.
      return { isLegal: true, totalRuns: extraRuns, batterRuns: 0, bowlerRuns: 0, battersRun: extraRuns };
    case "penalty":
      // Not tied to a delivery -- handled by a dedicated store action
      // (addPenaltyRuns) that never reaches the ball engine. Defensive fallback only.
      return { isLegal: true, totalRuns: extraRuns, batterRuns: 0, bowlerRuns: 0, battersRun: 0 };
    default:
      return { isLegal: true, totalRuns: runsBat, batterRuns: runsBat, bowlerRuns: runsBat, battersRun: runsBat };
  }
}

export const EXTRA_LABELS: Record<ExtraType, string> = {
  wide: "Wide",
  "no-ball": "No Ball",
  bye: "Bye",
  "leg-bye": "Leg Bye",
  penalty: "Penalty",
};
