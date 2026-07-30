"use client";

// Ported verbatim from the desktop app.
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from "recharts";
import { ChartCard, chartTooltipStyle } from "./chart-card";
import type { RunsByOverPoint } from "@/lib/cricket/aggregations";

export function RunsByOverChart({ data, description }: { data: RunsByOverPoint[]; description: string }) {
  return (
    <ChartCard title="Runs by Over" description={description}>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="over"
              tick={{ fill: "#6b6b6b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Over", position: "insideBottom", offset: -2, fill: "#6b6b6b", fontSize: 10 }}
            />
            <YAxis tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              {...chartTooltipStyle}
              cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
              formatter={(value) => [`${value} runs`, "Total"]}
              labelFormatter={(l) => `Over ${l}`}
            />
            <Line
              type="monotone"
              dataKey="runs"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={<Dot r={4} fill="#2563eb" stroke="#181818" strokeWidth={2} />}
              activeDot={{ r: 6, fill: "#2563eb", stroke: "#181818", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
