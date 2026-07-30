import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WICKET_LABELS } from "@/lib/liveScoring/wickets";
import type { InningsState } from "@/lib/liveScoring/types";

export function WicketTimeline({ innings1, innings2 }: { innings1: InningsState; innings2: InningsState | null }) {
  const rows = [innings1, innings2]
    .filter((i): i is InningsState => Boolean(i))
    .flatMap((inn) => inn.fallOfWickets.map((fow) => ({ ...fow, team: inn.battingTeam, inningsNumber: inn.inningsNumber })));

  if (rows.length === 0) return null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Wicket Timeline</CardTitle>
        <CardDescription>Every fall of wicket, both innings</CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-2 px-4 pb-4">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 border-l-2 border-red/40 pl-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold">
                {r.playerOut} <span className="font-normal text-muted-2">— {WICKET_LABELS[r.dismissal]}</span>
              </p>
              <p className="text-[10.5px] text-muted-2">
                Inn {r.inningsNumber} · {r.team} · {r.teamRuns}-{r.wicketNumber} ({r.overLabel} ov)
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
