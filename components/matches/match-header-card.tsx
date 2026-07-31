import { Card } from "@/components/ui/card";
import { venueLabel } from "@/lib/matchCreation/defaults";
import { oversLabel } from "@/lib/liveScoring/overs";
import type { Fixture } from "@/lib/cricket/fixture-types";
import type { LiveMatchState } from "@/lib/liveScoring/types";

export function MatchHeaderCard({ fixture, state }: { fixture: Fixture; state: LiveMatchState | null }) {
  const [teamA, teamB] = fixture.teams ?? [];

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={
            fixture.status === "Live"
              ? "flex items-center gap-1.5 rounded-md bg-red px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white"
              : "rounded-md border border-border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-muted"
          }
        >
          {fixture.status === "Live" && <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-white" />}
          {fixture.status}
        </span>
        <span className="text-[10.5px] text-muted-2">{fixture.format}</span>
      </div>

      {teamA && teamB ? (
        <div className="flex flex-col gap-2">
          <TeamRow name={teamA.name} innings={state ? matchingInnings(state, teamA.name) : null} oversLimit={state?.oversLimit ?? null} />
          <TeamRow name={teamB.name} innings={state ? matchingInnings(state, teamB.name) : null} oversLimit={state?.oversLimit ?? null} />
        </div>
      ) : (
        <p className="text-[14px] font-bold">{fixture.name}</p>
      )}

      <p className="mt-3 truncate text-[10.5px] text-muted-2">
        {venueLabel(fixture.venue)} · {fixture.tournament.name}
      </p>
    </Card>
  );
}

function matchingInnings(state: LiveMatchState, teamName: string) {
  if (state.innings1.battingTeam === teamName) return state.innings1;
  if (state.innings2?.battingTeam === teamName) return state.innings2;
  return null;
}

function TeamRow({
  name,
  innings,
  oversLimit,
}: {
  name: string;
  innings: LiveMatchState["innings1"] | null;
  oversLimit: number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0 truncate text-[13.5px] font-bold">{name}</span>
      {innings && (
        <span className="tabular-nums flex-none text-[15px] font-extrabold">
          {innings.totalRuns}/{innings.totalWickets}
          <span className="ml-1.5 text-[10.5px] font-semibold text-muted-2">
            {oversLabel(innings.legalBalls)}
            {oversLimit ? `/${oversLimit}` : ""} ov
          </span>
        </span>
      )}
    </div>
  );
}
