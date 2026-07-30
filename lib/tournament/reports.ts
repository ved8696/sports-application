// Small, tournament-scoped report aggregations that lib/cricket/aggregations.ts
// doesn't already provide (it has batting stats/chart series, but no
// bowling-figures or partnership tracker). Operates on the same FilteredBall[]
// every chart on the Stats tab already consumes -- no separate data path.

import type { FilteredBall } from "@/lib/cricket/filters";

export interface BowlingFigure {
  bowler: string;
  matchId: string;
  wickets: number;
  runsConceded: number;
}

export function computeBowlingFigures(deliveries: FilteredBall[]): BowlingFigure[] {
  const byKey = new Map<string, BowlingFigure>();
  for (const ball of deliveries) {
    const key = `${ball.matchId}::${ball.bowler}`;
    if (!byKey.has(key)) byKey.set(key, { bowler: ball.bowler, matchId: ball.matchId, wickets: 0, runsConceded: 0 });
    const fig = byKey.get(key)!;
    fig.runsConceded += ball.runsTotal - (ball.extras?.byes ?? 0) - (ball.extras?.legbyes ?? 0);
    if (ball.wicket && ball.wicket.kind !== "run out") fig.wickets += 1;
  }
  return Array.from(byKey.values()).sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded);
}

export interface Partnership {
  matchId: string;
  batterA: string;
  batterB: string;
  runs: number;
}

/** Best partnership per batting pair per innings -- tracks a running total for the current pair-on-strike, resetting whenever the pair changes or a wicket falls. */
export function computePartnerships(deliveries: FilteredBall[]): Partnership[] {
  const grouped = new Map<string, FilteredBall[]>();
  for (const ball of deliveries) {
    const key = `${ball.matchId}::${ball.inningsIndex}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(ball);
  }

  const best = new Map<string, Partnership>();
  for (const [key, balls] of grouped) {
    const matchId = key.split("::")[0];
    let pairKey = "";
    let runs = 0;
    let pair: [string, string] | null = null;

    const flush = () => {
      if (!pair || runs === 0) return;
      const [a, b] = [pair[0], pair[1]].sort();
      const pk = `${matchId}::${a}::${b}::${best.size}`;
      const existingForPair = Array.from(best.values()).find((p) => p.matchId === matchId && ((p.batterA === a && p.batterB === b) || (p.batterA === b && p.batterB === a)));
      if (!existingForPair || existingForPair.runs < runs) {
        if (existingForPair) {
          existingForPair.runs = runs;
        } else {
          best.set(pk, { matchId, batterA: a, batterB: b, runs });
        }
      }
    };

    for (const ball of balls) {
      const currentPairKey = [ball.batter, ball.nonStriker].sort().join("::");
      if (currentPairKey !== pairKey) {
        flush();
        pairKey = currentPairKey;
        pair = [ball.batter, ball.nonStriker];
        runs = 0;
      }
      runs += ball.runsTotal;
      if (ball.wicket) {
        flush();
        pairKey = "";
        pair = null;
        runs = 0;
      }
    }
    flush();
  }

  return Array.from(best.values()).sort((a, b) => b.runs - a.runs);
}
