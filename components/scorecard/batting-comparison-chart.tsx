"use client";

// Reuses the existing ported desktop chart verbatim (components/analytics/charts/runs-by-batter-chart.tsx)
// -- same recharts config/colors/tooltip -- just fed this match's combined batting figures instead of
// the cross-match Analytics dashboard's dataset.
import { RunsByBatterChart } from "@/components/analytics/charts/runs-by-batter-chart";
import type { InningsState } from "@/lib/liveScoring/types";
import type { RunsByBatterPoint } from "@/lib/cricket/aggregations";

export function BattingComparisonChart({ innings1, innings2 }: { innings1: InningsState; innings2: InningsState | null }) {
  const points: RunsByBatterPoint[] = [innings1, innings2]
    .filter((i): i is InningsState => Boolean(i))
    .flatMap((inn) => Object.values(inn.batters).map((b) => ({ name: b.name, runs: b.runs, strikeRate: b.strikeRate })))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 8);

  if (points.length === 0) return null;
  return <RunsByBatterChart data={points} description="Top scorers, both innings" />;
}
