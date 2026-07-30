import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { InningsState } from "@/lib/liveScoring/types";

// No existing chart in the analytics library covers bowling figures (the
// desktop dashboard has none either) -- a sorted list is the natural fit
// here rather than forcing bowling figures into an unrelated chart shape.
export function BowlingComparison({ innings1, innings2 }: { innings1: InningsState; innings2: InningsState | null }) {
  const bowlers = [innings1, innings2]
    .filter((i): i is InningsState => Boolean(i))
    .flatMap((inn) => Object.values(inn.bowlers).map((b) => ({ ...b, team: inn.bowlingTeam })))
    .sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);

  if (bowlers.length === 0) return null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Bowling Comparison</CardTitle>
        <CardDescription>Both innings, ranked by wickets</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-white/[0.06] pt-1">
        {bowlers.map((b) => (
          <div key={`${b.team}-${b.name}`} className="flex items-center justify-between gap-2 py-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">{b.name}</p>
              <p className="truncate text-[10.5px] text-muted-2">{b.team}</p>
            </div>
            <p className="tabular-nums flex-none text-[13px] text-muted">
              {b.oversLabel}-{b.maidens}-{b.runsConceded}-{b.wickets}
              <span className="ml-1.5 text-[10.5px] text-muted-2">Econ {b.economy}</span>
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
