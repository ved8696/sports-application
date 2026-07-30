"use client";

// Ported from the desktop app -- identical recharts config/colors/tooltip.
// The only change: the legend swatches used Tailwind's `bg-electric`/
// `bg-emerald` utilities, which map to desktop-only CSS variables that don't
// exist in this app's theme. Replaced with inline styles using the exact
// same hex values the bars themselves already use two lines below, so the
// legend still matches the chart pixel-for-pixel.
import { ComposedChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { ChartCard, chartTooltipStyle } from "./chart-card";
import type { ManhattanPoint } from "@/lib/cricket/aggregations";

export function ManhattanChart({ data }: { data: ManhattanPoint[] }) {
  const hasPhaseData = data.some((d) => d.phase !== "All Overs");
  const firstDeathOver = data.find((d) => d.phase === "Death Overs")?.over;

  return (
    <ChartCard title="Manhattan Chart" description="Runs scored every over · full innings">
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="over" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
            {hasPhaseData && firstDeathOver && (
              <ReferenceLine x={firstDeathOver} stroke="rgba(37,99,235,0.4)" strokeDasharray="3 3" />
            )}
            <Tooltip
              {...chartTooltipStyle}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              formatter={(value, name, item) => {
                if (name === "runs") {
                  const w = item.payload.wickets;
                  return [`${value} runs${w ? ` · ${w} wkt${w > 1 ? "s" : ""}` : ""}`, "Over"];
                }
                return [value, name];
              }}
              labelFormatter={(l) => `Over ${l}`}
            />
            <Bar dataKey="runs" radius={[6, 6, 0, 0]} maxBarSize={22}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.phase === "Death Overs" ? "#b88746" : "#2563eb"}
                  fillOpacity={d.wickets > 0 ? 1 : 0.55}
                  stroke={d.wickets > 0 ? (d.phase === "Death Overs" ? "#b88746" : "#2563eb") : "transparent"}
                  strokeWidth={d.wickets > 0 ? 1.5 : 0}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex items-center gap-4 px-1 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "#2563eb" }} />
          {hasPhaseData ? "Powerplay / Middle" : "Runs per over"}
        </span>
        {hasPhaseData && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "#b88746" }} />
            Death Overs
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border-2 border-foreground/60 bg-transparent" />
          Wicket fell
        </span>
      </div>
    </ChartCard>
  );
}
