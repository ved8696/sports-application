"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle, Settings2, PauseCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchAiButton } from "@/components/search/search-ai-button";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useLiveScoringStore } from "@/lib/store/live-scoring-store";
import { OpenerSetup } from "@/components/live-scoring/opener-setup";
import { ScoreboardHeader } from "@/components/live-scoring/scoreboard-header";
import { ChaseHeader } from "@/components/live-scoring/chase-header";
import { BatterRows, CurrentBowlerCard } from "@/components/live-scoring/player-cards";
import { OverStrip } from "@/components/live-scoring/over-strip";
import { ScoringPad } from "@/components/live-scoring/scoring-pad";
import { ExtrasSheet } from "@/components/live-scoring/extras-sheet";
import { WicketSheet, type WicketConfirmInput } from "@/components/live-scoring/wicket-sheet";
import { RetireSheet } from "@/components/live-scoring/retire-sheet";
import { PlayerPickerSheet } from "@/components/live-scoring/player-picker-sheet";
import { MatchControlsSheet } from "@/components/live-scoring/match-controls-sheet";
import { InningsSummary } from "@/components/live-scoring/innings-summary";
import type { BallInput, ExtraType } from "@/lib/liveScoring/types";
import { computeChase, computeTarget } from "@/lib/liveScoring/target";

export default function LiveScoringPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { fixtures, status: fixtureStatus, error: fixtureError, load: loadFixtures } = useFixtureStore();
  const {
    state,
    status,
    error,
    load,
    recordBall,
    addPenaltyRuns,
    retire,
    selectNewBatter,
    selectNewBowler,
    declareInnings,
    pauseMatch,
    resumeMatch,
    finalizeAs,
    undo,
    undoStack,
  } = useLiveScoringStore();

  const [extrasOpen, setExtrasOpen] = useState(false);
  const [wicketOpen, setWicketOpen] = useState(false);
  const [retireOpen, setRetireOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

  useEffect(() => {
    loadFixtures();
  }, [loadFixtures]);

  useEffect(() => {
    if (fixtureId) load(fixtureId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId]);

  useEffect(() => {
    if (state?.status === "completed") router.replace(`/matches/${fixtureId}/scorecard`);
  }, [state?.status, fixtureId, router]);

  const fixture = fixtures.find((f) => f.id === fixtureId) ?? null;
  const innings = state ? (state.currentInnings === 1 ? state.innings1 : state.innings2) : null;
  const matchLive = state?.status === "in-progress";

  // Root cause of the old infinite-spinner bug: the loading gate used to
  // include `!fixture` as a catch-all, so a genuinely nonexistent/deleted/
  // malformed fixture id (fixture permanently null) never distinguished
  // itself from "still loading" -- the spinner never had a terminal state to
  // fall through to. These flags are mutually exclusive and, together, cover
  // every reachable combination of the two stores' statuses.
  const fixtureLoadFailed = fixtureStatus === "error";
  const bootstrapping = fixtureStatus === "idle" || fixtureStatus === "loading" || status === "idle" || status === "loading";
  const fixtureNotFound = !bootstrapping && !fixtureLoadFailed && !fixture;
  const liveLoadFailed = !bootstrapping && !fixtureLoadFailed && !fixtureNotFound && status === "error";

  const battingXI = fixture?.playingXI?.find((x) => x.team === innings?.battingTeam)?.players ?? [];
  const bowlingXI = fixture?.playingXI?.find((x) => x.team === innings?.bowlingTeam)?.players ?? [];

  const needsNewBatter = Boolean(matchLive && innings && (!innings.strikerName || !innings.nonStrikerName));
  const needsNewBowler = Boolean(matchLive && innings && !innings.currentBowlerName);

  const chase = state && state.currentInnings === 2 && innings ? computeChase(computeTarget(state.innings1.totalRuns), innings, state.oversLimit) : null;

  function handleRun(runs: number) {
    recordBall({ runsBat: runs, extra: null, extraRuns: 0, wicket: null });
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
    recordBall({
      runsBat: input.type === "run-out" ? input.runsCompleted : 0,
      extra: null,
      extraRuns: 0,
      wicket: { type: input.type, playerOut: input.playerOut, fielder: input.fielder },
    });
  }

  function handleRetireConfirm(playerOut: string, type: "retired-hurt" | "retired-out") {
    setRetireOpen(false);
    retire(playerOut, type);
  }

  const remainingBatters = innings ? battingXI.filter((name) => !innings.battingOrder.includes(name)) : [];
  const eligibleBowlers = innings ? bowlingXI.filter((name) => name !== innings.previousOverBowlerName) : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center gap-3 px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <Link
          href={fixture ? `/matches/${fixtureId}` : "/matches"}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold">{fixture?.name ?? "Live Scoring"}</h1>
          {innings && (
            <p className="truncate text-[11px] text-muted">
              Innings {innings.inningsNumber} · {fixture?.venue.name}
            </p>
          )}
        </div>
        <SearchAiButton />
        {state && state.status !== "innings-break" && (
          <button
            type="button"
            onClick={() => setControlsOpen(true)}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
            aria-label="Match controls"
          >
            <Settings2 size={16} />
          </button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {fixtureLoadFailed && (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle size={18} className="text-red" />
            <p className="text-sm font-semibold">Couldn&apos;t load this match</p>
            <p className="text-xs text-muted">{fixtureError ?? "Check your connection and try again."}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => loadFixtures()}>
                Retry
              </Button>
              <Button size="sm" asChild>
                <Link href="/matches">Back to Matches</Link>
              </Button>
            </div>
          </Card>
        )}

        {fixtureNotFound && (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle size={18} className="text-red" />
            <p className="text-sm font-semibold">Match not found</p>
            <p className="text-xs text-muted">This fixture may have been removed, or the link is incorrect.</p>
            <Button size="sm" asChild>
              <Link href="/matches">Back to Matches</Link>
            </Button>
          </Card>
        )}

        {bootstrapping && (
          <Card className="flex items-center justify-center gap-2.5 py-16 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-blue" />
            Loading match…
          </Card>
        )}

        {liveLoadFailed && (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle size={18} className="text-red" />
            <p className="text-sm font-semibold">Something went wrong</p>
            <p className="text-xs text-muted">{error}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => load(fixtureId)}>
                Retry
              </Button>
              <Button size="sm" asChild>
                <Link href="/matches">Back to Matches</Link>
              </Button>
            </div>
          </Card>
        )}

        {status === "not-started" && fixture && <OpenerSetup fixture={fixture} />}

        {status === "ready" && state && fixture && state.status === "innings-break" && (
          <div className="flex flex-col gap-5">
            <Card className="flex flex-col items-center gap-1 py-5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-wood">Innings Complete</p>
              <p className="text-[13px] text-muted">
                {state.innings1.battingTeam} scored {state.innings1.totalRuns}/{state.innings1.totalWickets}. Target for{" "}
                {state.innings1.bowlingTeam}: {computeTarget(state.innings1.totalRuns)}.
              </p>
            </Card>
            <InningsSummary innings={state.innings1} />
            <OpenerSetup fixture={fixture} inningsNumber={2} battingTeam={state.innings1.bowlingTeam} bowlingTeam={state.innings1.battingTeam} />
          </div>
        )}

        {status === "ready" && state && state.status === "paused" && (
          <Card className="flex flex-col items-center gap-2 py-14 text-center">
            <PauseCircle size={20} className="text-muted-2" />
            <p className="text-sm font-semibold">Match Paused</p>
            <Button size="sm" onClick={() => resumeMatch()} className="mt-2">
              Resume Match
            </Button>
          </Card>
        )}

        {status === "ready" && state && state.status === "in-progress" && innings && (
          <div className="flex flex-col gap-4">
            {chase && <ChaseHeader chase={chase} />}
            <ScoreboardHeader innings={innings} oversLimit={state.oversLimit} />
            <BatterRows innings={innings} onRetire={!needsNewBatter ? () => setRetireOpen(true) : undefined} />
            <CurrentBowlerCard innings={innings} />
            <OverStrip innings={innings} />
          </div>
        )}
      </div>

      {status === "ready" && state && state.status === "in-progress" && innings && (
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

      {innings && state?.status === "in-progress" && (
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

      {state && (
        <MatchControlsSheet
          open={controlsOpen}
          onOpenChange={setControlsOpen}
          isPaused={state.status === "paused"}
          canDeclare={state.currentInnings === 1 && state.oversLimit === null && matchLive}
          canMarkDraw={state.oversLimit === null}
          onPause={() => {
            setControlsOpen(false);
            pauseMatch();
          }}
          onResume={() => {
            setControlsOpen(false);
            resumeMatch();
          }}
          onDeclare={() => {
            setControlsOpen(false);
            declareInnings();
          }}
          onNoResult={() => {
            setControlsOpen(false);
            finalizeAs("no-result");
          }}
          onDraw={() => {
            setControlsOpen(false);
            finalizeAs("draw");
          }}
        />
      )}
    </div>
  );
}
