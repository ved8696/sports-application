"use client";

// Reuses the existing ported BoundaryDistributionChart verbatim (components/analytics/charts/
// boundary-distribution-chart.tsx) -- same pie chart, tooltip, legend. Slice colors follow this
// scorecard's own team-color convention (team 1 = wood family, team 2 = blue family) rather than
// the cross-match dashboard's rotating PALETTE, which is keyed to CSS variables this app doesn't define.
import { BoundaryDistributionChart } from "@/components/analytics/charts/boundary-distribution-chart";
import { boundaryCounts } from "@/lib/liveScoring/scoreboard";
import type { InningsState } from "@/lib/liveScoring/types";
import type { BoundarySlice } from "@/lib/cricket/aggregations";

export function BoundaryBreakdown({ innings1, innings2 }: { innings1: InningsState; innings2: InningsState | null }) {
  const b1 = boundaryCounts(innings1);
  const b2 = innings2 ? boundaryCounts(innings2) : { fours: 0, sixes: 0 };
  const total = b1.fours + b1.sixes + b2.fours + b2.sixes;
  if (total === 0) return null;

  const pct = (n: number) => Number(((n / total) * 100).toFixed(1));

  const slices: BoundarySlice[] = [
    { name: `${innings1.battingTeam} Fours`, value: pct(b1.fours), color: "#b88746" },
    { name: `${innings1.battingTeam} Sixes`, value: pct(b1.sixes), color: "#8d6748" },
  ];
  if (innings2) {
    slices.push(
      { name: `${innings2.battingTeam} Fours`, value: pct(b2.fours), color: "#2563eb" },
      { name: `${innings2.battingTeam} Sixes`, value: pct(b2.sixes), color: "#1d4ed8" }
    );
  }

  return <BoundaryDistributionChart data={slices.filter((s) => s.value > 0)} />;
}
