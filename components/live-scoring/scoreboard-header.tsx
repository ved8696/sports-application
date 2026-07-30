"use client";

import { Card } from "@/components/ui/card";
import type { InningsState } from "@/lib/liveScoring/types";
import { activePartnership, inningsRunRate, lastWicketSummary } from "@/lib/liveScoring/scoreboard";
import { oversLabel } from "@/lib/liveScoring/overs";

export function ScoreboardHeader({ innings, oversLimit }: { innings: InningsState; oversLimit: number | null }) {
  const partnership = activePartnership(innings);
  const lastWicket = lastWicketSummary(innings);

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-wood">{innings.battingTeam}</p>
          <p className="tabular-nums mt-0.5 text-[32px] font-extrabold leading-none">
            {innings.totalRuns}
            <span className="text-xl text-muted-2">/{innings.totalWickets}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="tabular-nums text-[15px] font-bold">
            {oversLabel(innings.legalBalls)}
            {oversLimit ? ` / ${oversLimit}` : ""} ov
          </p>
          <p className="text-[11px] text-muted-2">CRR {inningsRunRate(innings).toFixed(2)}</p>
        </div>
      </div>

      {partnership && (
        <p className="mt-2.5 text-[11.5px] text-muted">
          Partnership <span className="font-semibold text-foreground">{partnership.runs}</span> ({partnership.balls} balls)
        </p>
      )}
      {lastWicket && <p className="mt-1 text-[11px] text-muted-2">Last wicket: {lastWicket}</p>}
    </Card>
  );
}
