"use client";

// Single integration point between the global store and the UI. Call this once
// per page (not once per chart) and pass the resulting slices down as props --
// that keeps every expensive computation memoized and computed exactly once
// per render instead of once per component.

import { useEffect, useMemo } from "react";
import { useCricketStore } from "@/lib/store/cricket-store";
import { applyFilters, defaultFilterState, extractFilterOptions } from "@/lib/cricket/filters";
import {
  computeBatterStats,
  computeBoundaryDistribution,
  computeDismissalTypes,
  computeKpis,
  computeManhattanData,
  computeMatchSummaries,
  computeRunRateProgression,
  computeRunsByBatter,
  computeRunsByOver,
  computeTeamSummaries,
} from "@/lib/cricket/aggregations";

export function useCricketDashboard() {
  const { matches, playerBios, filters, status, error, load, setFilter, resetFilters } = useCricketStore();

  useEffect(() => {
    load();
  }, [load]);

  const filterOptions = useMemo(() => extractFilterOptions(matches, playerBios), [matches, playerBios]);

  const filtered = useMemo(() => applyFilters(matches, filters, playerBios), [matches, filters, playerBios]);

  const baselineDeliveries = useMemo(
    () => applyFilters(matches, defaultFilterState(), playerBios).deliveries,
    [matches, playerBios]
  );

  const kpis = useMemo(() => computeKpis(filtered.deliveries, baselineDeliveries), [filtered.deliveries, baselineDeliveries]);
  const runsByBatter = useMemo(() => computeRunsByBatter(filtered.deliveries), [filtered.deliveries]);
  const runsByOver = useMemo(() => computeRunsByOver(filtered.deliveries), [filtered.deliveries]);
  const boundaryDistribution = useMemo(() => computeBoundaryDistribution(filtered.deliveries), [filtered.deliveries]);
  const runRateProgression = useMemo(
    () => computeRunRateProgression(filtered.deliveries, baselineDeliveries),
    [filtered.deliveries, baselineDeliveries]
  );
  const dismissalTypes = useMemo(() => computeDismissalTypes(filtered.deliveries), [filtered.deliveries]);
  const manhattanData = useMemo(() => computeManhattanData(filtered.deliveries), [filtered.deliveries]);
  const batterStats = useMemo(() => computeBatterStats(filtered.deliveries, playerBios), [filtered.deliveries, playerBios]);

  const matchSummaries = useMemo(() => computeMatchSummaries(filtered.matches), [filtered.matches]);
  const teamSummaries = useMemo(() => computeTeamSummaries(filtered.matches), [filtered.matches]);

  return {
    status,
    error,
    isEmpty: status === "ready" && matches.length === 0,
    filters,
    filterOptions,
    setFilter,
    resetFilters,
    matchCount: filtered.matches.length,
    deliveryCount: filtered.deliveries.length,
    kpis,
    runsByBatter,
    runsByOver,
    boundaryDistribution,
    runRateProgression,
    dismissalTypes,
    manhattanData,
    batterStats,
    matchSummaries,
    teamSummaries,
    hasVideoData: filtered.matches.some((m) => m.video && m.video.length > 0),
    videoClips: filtered.matches.flatMap((m) => m.video ?? []),
  };
}

export type CricketDashboardData = ReturnType<typeof useCricketDashboard>;
