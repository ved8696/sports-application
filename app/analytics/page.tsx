"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
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
      <header
        className="flex flex-none items-center gap-3 px-5 pb-4"
        style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}
      >
        <Link
          href="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-extrabold">Analytics</h1>
          <p className="text-[11px] text-muted">Deep-dive stats across every tracked match</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {(data.status === "idle" || data.status === "loading") && (
          <Card className="flex items-center justify-center gap-2.5 py-16 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-blue" />
            Loading match data…
          </Card>
        )}

        {data.status === "error" && (
          <Card className="flex flex-col items-center gap-2 py-16 text-center">
            <AlertTriangle size={18} className="text-red" />
            <p className="text-sm font-semibold">Couldn&apos;t load cricket data</p>
            <p className="text-xs text-muted">{data.error}</p>
          </Card>
        )}

        {data.status === "ready" && data.isEmpty && (
          <Card className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted">
            No match data found in /data.
          </Card>
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
      </div>
    </div>
  );
}
