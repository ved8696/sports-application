import { Card } from "@/components/ui/card";
import type { InningsState } from "@/lib/liveScoring/types";
import { boundaryPercentage, dotBallPercentage, extrasTotalCount, inningsRunRate } from "@/lib/liveScoring/scoreboard";
import { oversLabel } from "@/lib/liveScoring/overs";

const ROWS: { label: string; get: (i: InningsState) => string | number }[] = [
  { label: "Score", get: (i) => `${i.totalRuns}/${i.totalWickets}` },
  { label: "Overs", get: (i) => oversLabel(i.legalBalls) },
  { label: "Run Rate", get: (i) => inningsRunRate(i).toFixed(2) },
  { label: "Extras", get: (i) => extrasTotalCount(i) },
  { label: "Boundary %", get: (i) => `${boundaryPercentage(i)}%` },
  { label: "Dot Ball %", get: (i) => `${dotBallPercentage(i)}%` },
];

export function TeamComparison({ innings1, innings2 }: { innings1: InningsState; innings2: InningsState | null }) {
  return (
    <Card className="px-4">
      <p className="pt-3.5 text-[11px] font-bold uppercase tracking-wide text-wood">Team Comparison</p>
      <div className="grid grid-cols-3 gap-2 pb-1 pt-2.5 text-center">
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-2" />
        <span className="truncate text-[11px] font-bold text-wood">{innings1.battingTeam}</span>
        <span className="truncate text-[11px] font-bold text-blue">{innings2?.battingTeam ?? "—"}</span>
      </div>
      <div className="divide-y divide-white/[0.06] pb-2">
        {ROWS.map((row) => (
          <div key={row.label} className="grid grid-cols-3 items-center gap-2 py-2 text-center">
            <span className="truncate text-left text-[11.5px] text-muted-2">{row.label}</span>
            <span className="tabular-nums text-[13px] font-semibold">{row.get(innings1)}</span>
            <span className="tabular-nums text-[13px] font-semibold">{innings2 ? row.get(innings2) : "—"}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
