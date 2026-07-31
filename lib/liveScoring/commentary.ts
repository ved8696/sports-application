// Ball-by-ball commentary text -- deterministically templated from the
// BallEvent fields already recorded by the scoring engine. No AI/model
// involved; every sentence is generated straight from real recorded data
// (runs, extras, wicket type/fielder, striker/bowler names).

import type { BallEvent } from "./types";
import { WICKET_LABELS } from "./wickets";

export function ballOverLabel(event: BallEvent): string {
  return `${event.overNumber}.${event.ballInOver}`;
}

export function isMilestoneBall(event: BallEvent): boolean {
  return !event.wicket && !event.extra && (event.runsBat === 4 || event.runsBat === 6);
}

export function ballCommentary(event: BallEvent): string {
  const { bowlerName, strikerName, runsBat, extra, extraRuns, wicket } = event;

  if (wicket) {
    const label = WICKET_LABELS[wicket.type];
    const fielderPart = wicket.fielder ? ` (${wicket.fielder})` : "";
    return `${bowlerName} to ${wicket.playerOut}, OUT! ${label}${fielderPart}.`;
  }

  if (extra === "wide") return `${bowlerName} to ${strikerName}, called wide${extraRuns > 1 ? `, ${extraRuns} runs` : ""}.`;
  if (extra === "no-ball") {
    return `${bowlerName} to ${strikerName}, no ball${runsBat > 0 ? `, ${runsBat} run${runsBat === 1 ? "" : "s"} off the bat` : ""}.`;
  }
  if (extra === "bye") return `${bowlerName} to ${strikerName}, ${extraRuns} bye${extraRuns === 1 ? "" : "s"} taken.`;
  if (extra === "leg-bye") return `${bowlerName} to ${strikerName}, ${extraRuns} leg bye${extraRuns === 1 ? "" : "s"}.`;
  if (extra === "penalty") return `Penalty runs awarded to the batting side — ${extraRuns} run${extraRuns === 1 ? "" : "s"}.`;

  if (runsBat === 6) return `${bowlerName} to ${strikerName}, SIX! That's the maximum.`;
  if (runsBat === 4) return `${bowlerName} to ${strikerName}, FOUR! Finds the boundary.`;
  if (runsBat === 0) return `${bowlerName} to ${strikerName}, no run.`;
  return `${bowlerName} to ${strikerName}, ${runsBat} run${runsBat === 1 ? "" : "s"} taken.`;
}
