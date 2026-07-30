"use client";

// Ported verbatim from the desktop app -- same recharts config, colors, and
// tooltip formatting. Fully responsive already (ResponsiveContainer), no
// changes needed for the mobile shell.
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { ChartCard, chartTooltipStyle } from "./chart-card";
import type { RunsByBatterPoint } from "@/lib/cricket/aggregations";

// Single series (one bar per batter, ranked by runs) -- one hue for all bars,
// not alternated. Alternating colors here would imply identity groups that
// don't exist; rank is already shown by bar length and position.
const BAR_COLOR = "#b88746";

export function RunsByBatterChart({ data, description }: { data: RunsByBatterPoint[]; description: string }) {
  return (
    <ChartCard title="Runs by Batter" description={description}>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis type="number" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={118}
              tick={{ fill: "#a3a3a3", fontSize: 11.5 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              {...chartTooltipStyle}
              formatter={(value, _name, item) => [`${value} runs · SR ${item.payload.strikeRate}`, "Batter"]}
            />
            <Bar dataKey="runs" radius={[0, 8, 8, 0]} maxBarSize={18}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLOR} fillOpacity={0.85} />
              ))}
              <LabelList dataKey="runs" position="right" style={{ fill: "#f5f5f5", fontSize: 11, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
