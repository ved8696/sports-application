"use client";

import { AlertTriangle, FileBarChart } from "lucide-react";
import { EmptyState, LoadingState } from "@/components/ui/empty-state";
import { ScreenHeader, ScreenBody } from "@/components/mobile/app-screen";
import { SearchAiButton } from "@/components/search/search-ai-button";
import { FilterBar } from "@/components/analytics/filter-bar";
import { KpiCards } from "@/components/analytics/kpi-cards";
import { ChartGrid } from "@/components/analytics/chart-grid";
import { useCricketDashboard } from "@/lib/cricket/useCricketDashboard";
import { ALL } from "@/lib/cricket/filters";

// Mobile port of the desktop app's app/analytics/page.tsx -- same
// useCricketDashboard() data (KPIs, chart series, filters) computed by the
// same statistics engine, laid out for a single-column phone shell instead
// of a desktop dashboard grid.
export default function AnalyticsPage() {
  const data = useCricketDashboard();
  const scopeLabel = [
    data.filters.phase !== "All Overs" ? data.filters.phase : null,
    data.filters.tournament !== ALL ? data.filters.tournament : "All Tournaments",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader
        backHref="/dashboard"
        title="Analytics"
        subtitle="Deep-dive stats across every tracked match"
        trailing={<SearchAiButton />}
      />

      <ScreenBody>
        {(data.status === "idle" || data.status === "loading") && <LoadingState label="Loading match data…" />}

        {data.status === "error" && (
          <EmptyState icon={AlertTriangle} title="Couldn't load cricket data" description={data.error ?? undefined} tone="danger" />
        )}

        {data.status === "ready" && data.isEmpty && (
          <EmptyState icon={FileBarChart} title="No match data found" description="Drop Cricsheet-format match JSON files into /data and reload." />
        )}

        {data.status === "ready" && !data.isEmpty && (
          <div className="flex flex-col gap-5">
            <FilterBar options={data.filterOptions} filters={data.filters} setFilter={data.setFilter} resetFilters={data.resetFilters} />
            <KpiCards kpis={data.kpis} />
            <ChartGrid
              runsByBatter={data.runsByBatter}
              runsByOver={data.runsByOver}
              boundaryDistribution={data.boundaryDistribution}
              runRateProgression={data.runRateProgression}
              dismissalTypes={data.dismissalTypes}
              manhattanData={data.manhattanData}
              totalWickets={data.kpis.find((k) => k.label === "Wickets Lost")?.value ?? 0}
              scopeLabel={scopeLabel}
            />
          </div>
        )}
      </ScreenBody>
    </div>
  );
}
