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

export interface OverSummaryRow {
  overNumber: number;
  bowler: string;
  runs: number;
  wickets: number;
  balls: { label: string; isWicket: boolean; isBoundary: boolean }[];
}

/** Runs/wickets per completed over, oldest first -- feeds both the innings-break summary and the scorecard's over-by-over list. */
export function oversSummary(innings: InningsState): OverSummaryRow[] {
  return innings.completedOvers.map((events, i) => ({
    overNumber: i,
    bowler: events[0]?.bowlerName ?? "",
    runs: events.reduce((sum, e) => sum + e.totalRuns, 0),
    wickets: events.filter((e) => e.wicket).length,
    balls: events.map((e) => ({ label: ballShortLabel(e), isWicket: Boolean(e.wicket), isBoundary: !e.wicket && (e.runsBat === 4 || e.runsBat === 6) })),
  }));
}

/** Cumulative team total after each completed over -- shaped for the existing RunRateChart component (dataKey "runRate"/"over"). */
export function cumulativeRunsByOver(innings: InningsState): { over: number; runs: number }[] {
  let total = 0;
  return innings.completedOvers.map((events, i) => {
    total += events.reduce((sum, e) => sum + e.totalRuns, 0);
    return { over: i + 1, runs: total };
  });
}

export function extrasTotalCount(innings: InningsState): number {
  const e = innings.extrasTotal;
  return e.wide + e["no-ball"] + e.bye + e["leg-bye"] + e.penalty;
}

/** % of legal deliveries that produced zero runs (post-match analytics' "Dot Ball %"). */
export function dotBallPercentage(innings: InningsState): number {
  if (innings.legalBalls === 0) return 0;
  const dots = innings.events.filter((e) => e.isLegal && e.totalRuns === 0).length;
  return Number(((dots / innings.legalBalls) * 100).toFixed(1));
}

/** % of legal deliveries that went for a four or six (post-match analytics' "Boundary %"). */
export function boundaryPercentage(innings: InningsState): number {
  if (innings.legalBalls === 0) return 0;
  const boundaries = innings.events.filter((e) => e.isLegal && !e.wicket && (e.runsBat === 4 || e.runsBat === 6)).length;
  return Number(((boundaries / innings.legalBalls) * 100).toFixed(1));
}

export function boundaryCounts(innings: InningsState): { fours: number; sixes: number } {
  let fours = 0;
  let sixes = 0;
  for (const b of Object.values(innings.batters)) {
    fours += b.fours;
    sixes += b.sixes;
  }
  return { fours, sixes };
}
