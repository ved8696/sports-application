// Automatic Match Report -- deterministic, rule-based text generation (not
// AI). "Turning point" uses a documented heuristic: the wicket that broke
// the match's highest-value partnership, or for a successful chase, the
// moment the target was reached.

import type { BallEvent, InningsState, LiveMatchState, MatchReport, MatchReportHighlight, MatchResultDetail } from "./types";

/** The over/ball label as it stood at the moment this event was recorded, not the innings' final tally. */
function eventOverLabel(event: BallEvent): string {
  return `${event.overNumber}.${event.ballInOver}`;
}

function allInnings(state: LiveMatchState): InningsState[] {
  return [state.innings1, state.innings2].filter((i): i is InningsState => Boolean(i));
}

function highestPartnership(state: LiveMatchState): MatchReport["highestPartnership"] {
  let best: { batters: [string, string]; runs: number; inningsNumber: 1 | 2 } | null = null;
  for (const inn of allInnings(state)) {
    for (const p of inn.partnerships) {
      if (!best || p.runs > best.runs) best = { batters: [p.batterA, p.batterB], runs: p.runs, inningsNumber: inn.inningsNumber };
    }
  }
  return best;
}

function topPerformers(state: LiveMatchState): MatchReport["topPerformers"] {
  const performers: { name: string; description: string; score: number }[] = [];
  for (const inn of allInnings(state)) {
    for (const b of Object.values(inn.batters)) {
      if (b.runs >= 20) performers.push({ name: b.name, description: `${b.runs} (${b.balls}) for ${inn.battingTeam}`, score: b.runs });
    }
    for (const bo of Object.values(inn.bowlers)) {
      if (bo.wickets >= 2) {
        performers.push({
          name: bo.name,
          description: `${bo.wickets}/${bo.runsConceded} (${bo.oversLabel}) for ${inn.bowlingTeam}`,
          score: bo.wickets * 25,
        });
      }
    }
  }
  return performers
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ name, description }) => ({ name, description }));
}

function turningPoint(state: LiveMatchState, result: MatchResultDetail): string {
  if (result.type === "win" && result.marginWickets !== undefined && state.innings2) {
    return `${state.innings2.battingTeam} sealed the chase with ${result.marginWickets} wicket${result.marginWickets === 1 ? "" : "s"} in hand.`;
  }
  const partnership = highestPartnership(state);
  if (partnership) {
    return `The ${partnership.runs}-run partnership between ${partnership.batters[0]} and ${partnership.batters[1]} shaped the innings.`;
  }
  return "A tightly contested match throughout.";
}

function highlights(state: LiveMatchState): MatchReportHighlight[] {
  const points: MatchReportHighlight[] = [];
  for (const inn of allInnings(state)) {
    for (const event of inn.events) {
      if (event.wicket) {
        points.push({ label: `Wicket: ${event.wicket.playerOut}`, inningsNumber: inn.inningsNumber, overLabel: eventOverLabel(event) });
      } else if (event.runsBat === 6) {
        points.push({ label: `Six: ${event.strikerName}`, inningsNumber: inn.inningsNumber, overLabel: eventOverLabel(event) });
      }
    }
  }
  return points;
}

export function generateMatchReport(state: LiveMatchState, result: MatchResultDetail): MatchReport {
  return {
    summary: result.summaryText,
    highestPartnership: highestPartnership(state),
    turningPoint: turningPoint(state, result),
    topPerformers: topPerformers(state),
    highlights: highlights(state),
  };
}
