"use client";

// Ported from the desktop app's components/dashboard/kpi-cards.tsx -- same
// Kpi data (lib/cricket/aggregations.ts computeKpis, reused unchanged), same
// AnimatedNumber/trend-arrow treatment. Two changes only: laid out as the
// mobile app's established horizontal-scroll KPI row (see app/dashboard/page.tsx)
// instead of desktop's 2/3/6-column grid, and the accent tokens are remapped
// from the desktop-only emerald/electric/amber/rose CSS variables onto this
// app's own existing wood/walnut/blue/red palette (mobile never had those
// desktop tokens defined).
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "./animated-number";
import type { Kpi } from "@/lib/cricket/aggregations";
import { cn } from "@/lib/utils";

const accentMap: Record<Kpi["accent"], { text: string; bg: string }> = {
  emerald: { text: "text-wood", bg: "bg-wood/10" },
  electric: { text: "text-blue", bg: "bg-blue/10" },
  amber: { text: "text-walnut", bg: "bg-walnut/15" },
  rose: { text: "text-red", bg: "bg-red/10" },
};

export function KpiCards({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
      {kpis.map((kpi, i) => {
        const accent = accentMap[kpi.accent];
        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
            className="w-[148px] flex-none"
          >
            <Card className="relative overflow-hidden p-3.5">
              <div className={cn("pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-40", accent.bg)} />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-2">{kpi.label}</p>
              <p className="mt-1.5 text-xl font-extrabold tracking-tight text-foreground">
                <AnimatedNumber value={kpi.value} decimals={kpi.decimals ?? 0} suffix={kpi.suffix ?? ""} />
              </p>
              <div className={cn("mt-2 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-medium", accent.text, accent.bg)}>
                {kpi.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.delta}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
