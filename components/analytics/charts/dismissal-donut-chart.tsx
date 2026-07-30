"use client";

// Ported verbatim from the desktop app.
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard, chartTooltipStyle } from "./chart-card";
import type { BoundarySlice } from "@/lib/cricket/aggregations";

export function DismissalDonutChart({ data, totalWickets }: { data: BoundarySlice[]; totalWickets: number }) {
  return (
    <ChartCard title="Dismissal Types" description={`${totalWickets} wicket${totalWickets === 1 ? "" : "s"} lost, this selection`}>
      <div className="w-full">
        <div className="relative h-[190px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={86}
                paddingAngle={2.5}
                stroke="#181818"
                strokeWidth={2}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} formatter={(v, n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold">{totalWickets}</span>
            <span className="text-[11px] text-muted">Wickets</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 px-1 text-[11px]">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate">{d.name}</span>
              <span className="ml-auto font-medium text-foreground/80">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
