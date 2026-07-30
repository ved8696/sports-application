"use client";

// Ported verbatim from the desktop app.
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartCard, chartTooltipStyle } from "./chart-card";
import type { RunRatePoint } from "@/lib/cricket/aggregations";

export function RunRateChart({ data }: { data: RunRatePoint[] }) {
  return (
    <ChartCard title="Runs Progression" description="Cumulative total runs by over · filtered selection vs. all matches">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="rrFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b88746" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#b88746" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3a3a3" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#a3a3a3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="over" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...chartTooltipStyle} formatter={(v) => Number(v).toLocaleString()} labelFormatter={(l) => `Over ${l}`} />
            <Legend verticalAlign="top" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a3a3a3" }} />
            <Area type="monotone" dataKey="tournamentAvg" name="All Matches" stroke="#a3a3a3" strokeWidth={2} fill="url(#avgFill)" />
            <Area type="monotone" dataKey="runRate" name="Filtered Selection" stroke="#b88746" strokeWidth={2.5} fill="url(#rrFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
