"use client";

// Reuses the same recharts primitives, ChartCard wrapper, and tooltip
// styling as components/analytics/charts/run-rate-chart.tsx (the existing
// ported desktop chart) -- but that component's two series are hardcoded
// "Filtered Selection" vs "All Matches" for the cross-match Analytics
// dashboard, which doesn't fit a single match's two-innings comparison.
// Rather than mislabel that existing chart, this is a small sibling built
// from the same shared building blocks (chart-card.tsx) for this specific
// case, per "reuse the chart library, don't force an existing component's
// meaning to say something it doesn't."
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartCard, chartTooltipStyle } from "@/components/analytics/charts/chart-card";

export interface InningsRunPoint {
  over: number;
  runs: number;
}

export function RunRateGraph({ innings1, innings2 }: { innings1: InningsRunPoint[]; innings2: InningsRunPoint[] }) {
  const maxOver = Math.max(innings1.length, innings2.length);
  const data = Array.from({ length: maxOver }).map((_, i) => ({
    over: i + 1,
    innings1: innings1[i]?.runs ?? innings1[innings1.length - 1]?.runs ?? null,
    innings2: innings2[i]?.runs ?? null,
  }));

  return (
    <ChartCard title="Run Rate Progression" description="Cumulative runs by over, both innings">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="i1Fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b88746" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#b88746" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="i2Fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="over" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...chartTooltipStyle} labelFormatter={(l) => `Over ${l}`} />
            <Legend verticalAlign="top" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a3a3a3" }} />
            <Area type="monotone" dataKey="innings1" name="Innings 1" stroke="#b88746" strokeWidth={2.5} fill="url(#i1Fill)" connectNulls />
            <Area type="monotone" dataKey="innings2" name="Innings 2" stroke="#2563eb" strokeWidth={2.5} fill="url(#i2Fill)" connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
