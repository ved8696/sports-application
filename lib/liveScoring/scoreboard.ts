// Statistics/view-derivation layer -- turns raw InningsState into the small
// display strings the Live Scoreboard needs, kept separate from the engine
// so nothing here ever mutates state.

import type { BallEvent, InningsState } from "./types";
import { currentRunRate } from "./overs";

export function ballShortLabel(event: BallEvent): string {
  if (event.wicket) return "W";
  if (event.extra === "wide") return `Wd${event.extraRuns ? `+${event.extraRuns}` : ""}`;
  if (event.extra === "no-ball") return `Nb${event.runsBat ? `+${event.runsBat}` : ""}`;
  if (event.extra === "bye") return `B${event.extraRuns}`;
  if (event.extra === "leg-bye") return `Lb${event.extraRuns}`;
  if (event.extra === "penalty") return `P${event.extraRuns}`;
  return String(event.runsBat);
}

export function recentBallsDisplay(events: BallEvent[], count = 6): { label: string; isWicket: boolean; isBoundary: boolean }[] {
  return events.slice(-count).map((e) => ({
    label: ballShortLabel(e),
    isWicket: Boolean(e.wicket),
    isBoundary: !e.wicket && (e.runsBat === 4 || e.runsBat === 6),
  }));
}

export function lastWicketSummary(innings: InningsState): string | null {
  const last = innings.fallOfWickets[innings.fallOfWickets.length - 1];
  if (!last) return null;
  return `${last.playerOut} — ${last.teamRuns}/${last.wicketNumber} (${last.overLabel} ov)`;
}

export function inningsRunRate(innings: InningsState): number {
  return currentRunRate(innings.totalRuns, innings.legalBalls);
}

export function activePartnership(innings: InningsState) {
  return innings.partnerships[innings.partnerships.length - 1] ?? null;
}
