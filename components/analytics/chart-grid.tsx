"use client";

// Ported from the desktop app's components/dashboard/chart-grid.tsx -- same
// six charts, same stagger-in animation. Only the layout changed: desktop's
// grid-cols-1 md:grid-cols-2 xl:grid-cols-3 becomes a single scrollable
// column (the app shell is capped at 480px, so multi-column breakpoints
// would never fire here anyway) per "Desktop Grids -> Single Column".
import { motion } from "framer-motion";
import { RunsByBatterChart } from "./charts/runs-by-batter-chart";
import { RunsByOverChart } from "./charts/runs-by-over-chart";
import { BoundaryDistributionChart } from "./charts/boundary-distribution-chart";
import { RunRateChart } from "./charts/run-rate-chart";
import { DismissalDonutChart } from "./charts/dismissal-donut-chart";
import { ManhattanChart } from "./charts/manhattan-chart";
import type { BoundarySlice, ManhattanPoint, RunRatePoint, RunsByBatterPoint, RunsByOverPoint } from "@/lib/cricket/aggregations";

export interface ChartGridProps {
  runsByBatter: RunsByBatterPoint[];
  runsByOver: RunsByOverPoint[];
  boundaryDistribution: BoundarySlice[];
  runRateProgression: RunRatePoint[];
  dismissalTypes: BoundarySlice[];
  manhattanData: ManhattanPoint[];
  totalWickets: number;
  scopeLabel: string;
}

export function ChartGrid({
  runsByBatter,
  runsByOver,
  boundaryDistribution,
  runRateProgression,
  dismissalTypes,
  manhattanData,
  totalWickets,
  scopeLabel,
}: ChartGridProps) {
  const items = [
    <RunsByBatterChart key="a" data={runsByBatter} description={scopeLabel} />,
    <RunsByOverChart key="b" data={runsByOver} description={scopeLabel} />,
    <BoundaryDistributionChart key="c" data={boundaryDistribution} />,
    <RunRateChart key="d" data={runRateProgression} />,
    <DismissalDonutChart key="e" data={dismissalTypes} totalWickets={totalWickets} />,
    <ManhattanChart key="f" data={manhattanData} />,
  ];

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: "easeOut" }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}
