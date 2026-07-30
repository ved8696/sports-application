"use client";

import { Card } from "@/components/ui/card";
import type { ChaseState } from "@/lib/liveScoring/types";
import { cn } from "@/lib/utils";

export function ChaseHeader({ chase }: { chase: ChaseState }) {
  const progressPct = Math.min(100, Math.round(((chase.target - chase.runsRequired) / chase.target) * 100));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-blue">Target {chase.target}</p>
        <p className="text-[11px] font-semibold text-muted-2">
          {chase.ballsRemaining !== null ? `${chase.oversRemainingLabel} ov left` : "Unlimited overs"}
        </p>
      </div>
      <p className="mt-1.5 text-[15px] font-bold">
        Need <span className="text-blue">{chase.runsRequired}</span> run{chase.runsRequired === 1 ? "" : "s"}
        {chase.ballsRemaining !== null ? ` from ${chase.ballsRemaining} ball${chase.ballsRemaining === 1 ? "" : "s"}` : ""}
      </p>
      {chase.requiredRunRate !== null && <p className="mt-0.5 text-[11.5px] text-muted-2">RRR {chase.requiredRunRate.toFixed(2)}</p>}
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
        <div className={cn("h-full rounded-full bg-blue transition-all")} style={{ width: `${progressPct}%` }} />
      </div>
    </Card>
  );
}
