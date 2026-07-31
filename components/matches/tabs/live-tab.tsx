import Link from "next/link";
import { PauseCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreboardHeader } from "@/components/live-scoring/scoreboard-header";
import { ChaseHeader } from "@/components/live-scoring/chase-header";
import { BatterRows, CurrentBowlerCard } from "@/components/live-scoring/player-cards";
import { OverStrip } from "@/components/live-scoring/over-strip";
import { computeChase, computeTarget } from "@/lib/liveScoring/target";
import type { LiveMatchState } from "@/lib/liveScoring/types";

// Read-only spectator view of the live innings -- reuses the exact display
// components the interactive scorer (app/matches/[id]/live) already renders
// (ScoreboardHeader, ChaseHeader, BatterRows, CurrentBowlerCard, OverStrip),
// just without the ScoringPad footer or any of the mutating sheets. Scoring
// itself always happens on the dedicated /live route.
export function LiveTab({ state, fixtureId }: { state: LiveMatchState; fixtureId: string }) {
  const innings = state.currentInnings === 1 ? state.innings1 : state.innings2;

  return (
    <div className="flex flex-col gap-4">
      <Button asChild>
        <Link href={`/matches/${fixtureId}/live`}>Continue Scoring</Link>
      </Button>

      {state.status === "paused" && (
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <PauseCircle size={20} className="text-muted-2" />
          <p className="text-sm font-semibold">Match Paused</p>
        </Card>
      )}

      {state.status === "innings-break" && (
        <Card className="flex flex-col items-center gap-1 py-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-wood">Innings Break</p>
          <p className="text-[13px] text-muted">
            {state.innings1.battingTeam} scored {state.innings1.totalRuns}/{state.innings1.totalWickets}. Target for{" "}
            {state.innings1.bowlingTeam}: {computeTarget(state.innings1.totalRuns)}.
          </p>
        </Card>
      )}

      {innings && (state.status === "in-progress" || state.status === "paused") && (
        <>
          {state.currentInnings === 2 && (
            <ChaseHeader chase={computeChase(computeTarget(state.innings1.totalRuns), innings, state.oversLimit)} />
          )}
          <ScoreboardHeader innings={innings} oversLimit={state.oversLimit} />
          <BatterRows innings={innings} />
          <CurrentBowlerCard innings={innings} />
          <OverStrip innings={innings} />
        </>
      )}
    </div>
  );
}
