"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { KpiCards } from "@/components/analytics/kpi-cards";
import { RunRateChart } from "@/components/analytics/charts/run-rate-chart";
import { RunsByBatterChart } from "@/components/analytics/charts/runs-by-batter-chart";
import { BoundaryDistributionChart } from "@/components/analytics/charts/boundary-distribution-chart";
import { ManhattanChart } from "@/components/analytics/charts/manhattan-chart";
import { DismissalDonutChart } from "@/components/analytics/charts/dismissal-donut-chart";
import { useCricketStore } from "@/lib/store/cricket-store";
import { applyFilters, defaultFilterState } from "@/lib/cricket/filters";
import {
  computeBatterStats,
  computeBoundaryDistribution,
  computeDismissalTypes,
  computeKpis,
  computeManhattanData,
  computeRunRateProgression,
  computeRunsByBatter,
} from "@/lib/cricket/aggregations";

type StatsView = "overview" | "batting" | "bowling";

export function StatsTab({ tournamentName }: { tournamentName: string }) {
  const [view, setView] = useState<StatsView>("overview");
  const { matches, playerBios } = useCricketStore();

  const filtered = useMemo(() => applyFilters(matches, { ...defaultFilterState(), tournament: tournamentName }, playerBios), [matches, playerBios, tournamentName]);
  const baseline = useMemo(() => applyFilters(matches, defaultFilterState(), playerBios).deliveries, [matches, playerBios]);

  const kpis = useMemo(() => computeKpis(filtered.deliveries, baseline), [filtered.deliveries, baseline]);
  const runRateProgression = useMemo(() => computeRunRateProgression(filtered.deliveries, baseline), [filtered.deliveries, baseline]);
  const runsByBatter = useMemo(() => computeRunsByBatter(filtered.deliveries), [filtered.deliveries]);
  const boundaryDistribution = useMemo(() => computeBoundaryDistribution(filtered.deliveries), [filtered.deliveries]);
  const manhattanData = useMemo(() => computeManhattanData(filtered.deliveries), [filtered.deliveries]);
  const dismissalTypes = useMemo(() => computeDismissalTypes(filtered.deliveries), [filtered.deliveries]);
  const batterStats = useMemo(() => computeBatterStats(filtered.deliveries, playerBios), [filtered.deliveries, playerBios]);
  const topScorers = useMemo(() => [...batterStats].sort((a, b) => b.runs - a.runs).slice(0, 5), [batterStats]);
  const totalWickets = kpis.find((k) => k.label === "Wickets Lost")?.value ?? 0;

  if (filtered.matches.length === 0) {
    return <p className="px-5 pt-8 text-center text-xs text-muted">No completed matches yet — stats appear once fixtures finish.</p>;
  }

  return (
    <div className="flex flex-col">
      <Tabs
        options={[
          { value: "overview", label: "Overview" },
          { value: "batting", label: "Batting" },
          { value: "bowling", label: "Bowling" },
        ]}
        value={view}
        onChange={setView}
      />

      <div className="flex flex-col gap-4 px-5 pb-4 pt-3.5">
        {view === "overview" && (
          <>
            <KpiCards kpis={kpis} />
            <RunRateChart data={runRateProgression} />
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">Top Run Scorers</p>
              <div className="flex flex-col gap-1.5">
                {topScorers.map((b, i) => (
                  <div key={b.player} className="flex justify-between text-[12px] font-semibold">
                    <span>
                      {i + 1}. {b.player}
                    </span>
                    <span>{b.runs}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {view === "batting" && (
          <>
            <RunsByBatterChart data={runsByBatter} description="Top scorers · this tournament" />
            <BoundaryDistributionChart data={boundaryDistribution} />
          </>
        )}

        {view === "bowling" && (
          <>
            <ManhattanChart data={manhattanData} />
            <DismissalDonutChart data={dismissalTypes} totalWickets={Number(totalWickets)} />
          </>
        )}
      </div>
    </div>
  );
}
