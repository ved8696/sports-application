"use client";

// Ported verbatim from the desktop app.
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartCard, chartTooltipStyle } from "./chart-card";
import type { BoundarySlice } from "@/lib/cricket/aggregations";

export function BoundaryDistributionChart({ data }: { data: BoundarySlice[] }) {
  return (
    <ChartCard title="Boundary Distribution" description="Fours and sixes by team">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="46%"
              outerRadius={95}
              paddingAngle={2}
              stroke="#181818"
              strokeWidth={2}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...chartTooltipStyle} formatter={(v, n) => [`${v}%`, n]} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a3a3a3" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
