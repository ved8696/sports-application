// Player of the Match -- a deterministic, configurable point formula (NOT
// AI/ML). Weights are exported so a future sprint can tune them, or swap in
// a per-format profile, without touching the scoring logic itself.

import type { InningsState, LiveMatchState, PlayerImpactBreakdown, PlayerImpactScore, PotmResult, PotmWeights } from "./types";

export const DEFAULT_POTM_WEIGHTS: PotmWeights = {
  runPoint: 1,
  boundaryBonus: 1,
  sixBonus: 2,
  strikeRateBonus: 6, // flat bonus for a strike rate over 150 on a meaningful innings (10+ balls)
  wicketPoint: 20,
  economyBonus: 10, // flat bonus for an economy under 6 across at least 2 overs
  catchPoint: 8,
  runOutPoint: 8,
};

function battingPoints(innings: InningsState, name: string, weights: PotmWeights): number {
  const b = innings.batters[name];
  if (!b) return 0;
  let points = b.runs * weights.runPoint + b.fours * weights.boundaryBonus + b.sixes * weights.sixBonus;
  if (b.balls >= 10 && b.strikeRate >= 150) points += weights.strikeRateBonus;
  return points;
}

function bowlingPoints(innings: InningsState, name: string, weights: PotmWeights): number {
  const bo = innings.bowlers[name];
  if (!bo) return 0;
  let points = bo.wickets * weights.wicketPoint + bo.maidens * 5;
  if (bo.legalBalls >= 12 && bo.economy > 0 && bo.economy < 6) points += weights.economyBonus;
  return points;
}

function fieldingPoints(innings: InningsState, name: string, weights: PotmWeights): number {
  let points = 0;
  for (const event of innings.events) {
    if (!event.wicket || event.wicket.fielder !== name) continue;
    points += event.wicket.type === "run-out" ? weights.runOutPoint : weights.catchPoint;
  }
  return points;
}

function teamOf(state: LiveMatchState, name: string): string {
  if (state.innings1.battingOrder.includes(name)) return state.innings1.battingTeam;
  if (name in state.innings1.bowlers) return state.innings1.bowlingTeam;
  if (state.innings2?.battingOrder.includes(name)) return state.innings2.battingTeam;
  if (state.innings2 && name in state.innings2.bowlers) return state.innings2.bowlingTeam;
  return "";
}

export function computePlayerOfMatch(state: LiveMatchState, weights: PotmWeights = DEFAULT_POTM_WEIGHTS): PotmResult | null {
  const innings = [state.innings1, state.innings2].filter((i): i is InningsState => Boolean(i));
  if (innings.length === 0) return null;

  const names = new Set<string>();
  for (const inn of innings) {
    Object.keys(inn.batters).forEach((n) => names.add(n));
    Object.keys(inn.bowlers).forEach((n) => names.add(n));
  }

  const scores: PlayerImpactScore[] = Array.from(names).map((name) => {
    const breakdown: PlayerImpactBreakdown = { battingPoints: 0, bowlingPoints: 0, fieldingPoints: 0, total: 0 };
    for (const inn of innings) {
      breakdown.battingPoints += battingPoints(inn, name, weights);
      breakdown.bowlingPoints += bowlingPoints(inn, name, weights);
      breakdown.fieldingPoints += fieldingPoints(inn, name, weights);
    }
    breakdown.total = breakdown.battingPoints + breakdown.bowlingPoints + breakdown.fieldingPoints;
    return { name, team: teamOf(state, name), breakdown };
  });

  scores.sort((a, b) => b.breakdown.total - a.breakdown.total);

  const bestBatter = [...scores].sort((a, b) => b.breakdown.battingPoints - a.breakdown.battingPoints)[0];
  const bestBowler = [...scores].sort((a, b) => b.breakdown.bowlingPoints - a.breakdown.bowlingPoints)[0];
  const fielders = scores.filter((s) => s.breakdown.fieldingPoints > 0).sort((a, b) => b.breakdown.fieldingPoints - a.breakdown.fieldingPoints);

  return {
    playerOfMatch: scores[0],
    bestBatter,
    bestBowler,
    bestFielder: fielders[0] ?? null,
    allScores: scores,
  };
}
