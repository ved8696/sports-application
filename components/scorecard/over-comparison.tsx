"use client";

// Reuses the existing ported ManhattanChart (components/analytics/charts/manhattan-chart.tsx)
// verbatim -- one instance per innings, fed this match's own over-by-over data instead of
// the cross-match Analytics dataset. Phase bucketing reuses the same phaseForOver() the
// desktop Analytics dashboard already uses for the identical Powerplay/Middle/Death split.
import { ManhattanChart } from "@/components/analytics/charts/manhattan-chart";
import { phaseForOver } from "@/lib/cricket/filters";
import { oversSummary } from "@/lib/liveScoring/scoreboard";
import type { InningsState } from "@/lib/liveScoring/types";
import type { ManhattanPoint } from "@/lib/cricket/aggregations";

function toManhattanPoints(innings: InningsState, format: string): ManhattanPoint[] {
  return oversSummary(innings).map((o) => ({
    over: o.overNumber + 1,
    runs: o.runs,
    wickets: o.wickets,
    phase: phaseForOver(o.overNumber, format),
  }));
}

export function OverComparison({ innings1, innings2, format }: { innings1: InningsState; innings2: InningsState | null; format: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-wood">{innings1.battingTeam}</p>
        <ManhattanChart data={toManhattanPoints(innings1, format)} />
      </div>
      {innings2 && (
        <div>
          <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-blue">{innings2.battingTeam}</p>
          <ManhattanChart data={toManhattanPoints(innings2, format)} />
        </div>
      )}
    </div>
  );
}
