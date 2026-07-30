// Match Result Engine. Draw and No Result aren't auto-detectable without a
// day/session clock this app doesn't track (see engine.ts's declareNoResult/
// declareDraw actions for the manual scorer-triggered path) -- this function
// covers every outcome that genuinely follows from the ball-by-ball state:
// a completed run chase, a bowled-out or overs-completed second innings, or
// a level scores tie (flagged super-over-eligible, per Sprint 5's brief only
// asking for detection, not a full super-over sub-match).

import type { InningsState, MatchResultDetail } from "./types";
import { WICKETS_FOR_ALL_OUT } from "./innings-end";

export function computeMatchResult(innings1: InningsState, innings2: InningsState, target: number): MatchResultDetail | null {
  if (innings2.status !== "completed") return null;

  if (innings2.totalRuns >= target) {
    const wicketsInHand = WICKETS_FOR_ALL_OUT - innings2.totalWickets;
    return {
      type: "win",
      winner: innings2.battingTeam,
      marginWickets: wicketsInHand,
      summaryText: `${innings2.battingTeam} won by ${wicketsInHand} wicket${wicketsInHand === 1 ? "" : "s"}`,
    };
  }

  if (innings2.totalRuns === target - 1) {
    return { type: "tie", superOverEligible: true, summaryText: "Match tied" };
  }

  const marginRuns = target - 1 - innings2.totalRuns;
  return {
    type: "win",
    winner: innings1.battingTeam,
    marginRuns,
    summaryText: `${innings1.battingTeam} won by ${marginRuns} run${marginRuns === 1 ? "" : "s"}`,
  };
}
