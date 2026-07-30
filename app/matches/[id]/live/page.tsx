"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useLiveScoringStore } from "@/lib/store/live-scoring-store";
import { OpenerSetup } from "@/components/live-scoring/opener-setup";
import { ScoreboardHeader } from "@/components/live-scoring/scoreboard-header";
import { BatterRows, CurrentBowlerCard } from "@/components/live-scoring/player-cards";
import { OverStrip } from "@/components/live-scoring/over-strip";
import { ScoringPad } from "@/components/live-scoring/scoring-pad";
import { ExtrasSheet } from "@/components/live-scoring/extras-sheet";
import { WicketSheet, type WicketConfirmInput } from "@/components/live-scoring/wicket-sheet";
import { RetireSheet } from "@/components/live-scoring/retire-sheet";
import { PlayerPickerSheet } from "@/components/live-scoring/player-picker-sheet";
import type { BallInput, ExtraType } from "@/lib/liveScoring/types";

export default function LiveScoringPage() {
  const params = useParams();
  const fixtureId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { fixtures, load: loadFixtures } = useFixtureStore();
  const { state, status, error, load, recordBall, addPenaltyRuns, retire, selectNewBatter, selectNewBowler, undo, undoStack } =
    useLiveScoringStore();

  const [extrasOpen, setExtrasOpen] = useState(false);
  const [wicketOpen, setWicketOpen] = useState(false);
  const [retireOpen, setRetireOpen] = useState(false);

  useEffect(() => {
    loadFixtures();
  }, [loadFixtures]);

  useEffect(() => {
    if (fixtureId) load(fixtureId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId]);

  const fixture = fixtures.find((f) => f.id === fixtureId) ?? null;
  const innings = state ? (state.currentInnings === 1 ? state.innings1 : state.innings2) : null;

  const battingXI = fixture?.playingXI?.find((x) => x.team === innings?.battingTeam)?.players ?? [];
  const bowlingXI = fixture?.playingXI?.find((x) => x.team === innings?.bowlingTeam)?.players ?? [];

  const needsNewBatter = Boolean(innings && (!innings.strikerName || !innings.nonStrikerName));
  const needsNewBowler = Boolean(innings && !innings.currentBowlerName);

  function handleRun(runs: number) {
    const input: BallInput = { runsBat: runs, extra: null, extraRuns: 0, wicket: null };
    recordBall(input);
  }

  function handleExtraConfirm(extra: ExtraType, runs: number) {
    setExtrasOpen(false);
    const input: BallInput =
      extra === "wide"
        ? { runsBat: 0, extra: "wide", extraRuns: runs, wicket: null }
        : extra === "no-ball"
          ? { runsBat: runs, extra: "no-ball", extraRuns: 0, wicket: null }
          : { runsBat: 0, extra, extraRuns: runs, wicket: null };
    recordBall(input);
  }

  function handleWicketConfirm(input: WicketConfirmInput) {
    setWicketOpen(false);
    const ballInput: BallInput = {
      runsBat: input.type === "run-out" ? input.runsCompleted : 0,
      extra: null,
      extraRuns: 0,
      wicket: { type: input.type, playerOut: input.playerOut, fielder: input.fielder },
    };
    recordBall(ballInput);
  }

  function handleRetireConfirm(playerOut: string, type: "retired-hurt" | "retired-out") {
    setRetireOpen(false);
    retire(playerOut, type);
  }

  const remainingBatters = innings ? battingXI.filter((name) => !innings.battingOrder.includes(name)) : [];
  const eligibleBowlers = innings ? bowlingXI.filter((name) => name !== innings.previousOverBowlerName) : [];

  return (
    <div className="flex flex-1 flex-col">
      <header
        className="flex flex-none items-center gap-3 px-5 pb-4"
        style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}
      >
        <Link
          href={`/matches/${fixtureId}`}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold">{fixture?.name ?? "Live Scoring"}</h1>
          {innings && (
            <p className="truncate text-[11px] text-muted">
              Innings {innings.inningsNumber} · {fixture?.venue.name}
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {(status === "idle" || status === "loading" || !fixture) && (
          <Card className="flex items-center justify-center gap-2.5 py-16 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-blue" />
            Loading match…
          </Card>
        )}

        {status === "error" && (
          <Card className="flex flex-col items-center gap-2 py-16 text-center">
            <AlertTriangle size={18} className="text-red" />
            <p className="text-sm font-semibold">Something went wrong</p>
            <p className="text-xs text-muted">{error}</p>
          </Card>
        )}

        {status === "not-started" && fixture && <OpenerSetup fixture={fixture} />}

        {status === "ready" && state && innings && (
          <div className="flex flex-col gap-4">
            <ScoreboardHeader innings={innings} oversLimit={state.oversLimit} />
            <BatterRows innings={innings} onRetire={!needsNewBatter ? () => setRetireOpen(true) : undefined} />
            <CurrentBowlerCard innings={innings} />
            <OverStrip innings={innings} />
          </div>
        )}
      </div>

      {status === "ready" && state && innings && (
        <footer
          className="flex-none border-t border-white/[0.06] bg-background/95 px-5 pt-3 backdrop-blur-md"
          style={{ paddingBottom: "calc(var(--safe-bottom) + 14px)" }}
        >
          <ScoringPad
            onRun={handleRun}
            onExtras={() => setExtrasOpen(true)}
            onWicket={() => setWicketOpen(true)}
            onUndo={undo}
            onPenalty={() => addPenaltyRuns(5)}
            canUndo={undoStack.length > 0}
            disabled={needsNewBatter || needsNewBowler}
            isFreeHit={innings.isFreeHit}
          />
        </footer>
      )}

      {innings && (
        <>
          <ExtrasSheet
            key={extrasOpen ? "extras-open" : "extras-closed"}
            open={extrasOpen}
            onOpenChange={setExtrasOpen}
            onConfirm={handleExtraConfirm}
          />
          <WicketSheet
            key={wicketOpen ? "wicket-open" : "wicket-closed"}
            open={wicketOpen}
            onOpenChange={setWicketOpen}
            strikerName={innings.strikerName ?? ""}
            nonStrikerName={innings.nonStrikerName ?? ""}
            fieldingXI={bowlingXI}
            isFreeHit={innings.isFreeHit}
            onConfirm={handleWicketConfirm}
          />
          <RetireSheet
            key={retireOpen ? "retire-open" : "retire-closed"}
            open={retireOpen}
            onOpenChange={setRetireOpen}
            strikerName={innings.strikerName ?? ""}
            nonStrikerName={innings.nonStrikerName ?? ""}
            onConfirm={handleRetireConfirm}
          />
          <PlayerPickerSheet
            open={needsNewBatter}
            onOpenChange={() => {}}
            dismissible={false}
            title="Select New Batter"
            players={remainingBatters}
            onSelect={(name) => selectNewBatter(name)}
          />
          <PlayerPickerSheet
            open={needsNewBowler && !needsNewBatter}
            onOpenChange={() => {}}
            dismissible={false}
            title="Select New Bowler"
            players={eligibleBowlers}
            onSelect={(name) => selectNewBowler(name)}
          />
        </>
      )}
    </div>
  );
}
