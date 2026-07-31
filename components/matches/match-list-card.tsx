"use client";

import Link from "next/link";
import { Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { venueLabel } from "@/lib/matchCreation/defaults";
import { oversLabel } from "@/lib/liveScoring/overs";
import { inningsRunRate, recentBallsDisplay } from "@/lib/liveScoring/scoreboard";
import { computeChase, computeTarget } from "@/lib/liveScoring/target";
import { cn } from "@/lib/utils";
import type { Fixture } from "@/lib/cricket/fixture-types";
import type { LiveMatchState } from "@/lib/liveScoring/types";
import type { MatchSummary } from "@/lib/cricket/aggregations";

function daysUntil(date: string, startTime: string): string {
  const target = new Date(`${date}T${startTime || "00:00"}:00`).getTime();
  const diffMs = target - Date.now();
  if (diffMs <= 0) return "Starting soon";
  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  if (days === 0) return `Starts in ${hours}h`;
  return `Starts in ${days}d ${hours}h`;
}

function formatDateShort(iso: string, startTime: string): string {
  const d = new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (!startTime) return d;
  const [h, m] = startTime.split(":").map(Number);
  const t = new Date();
  t.setHours(h, m);
  return `${d}, ${t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

export function LiveMatchCard({ fixture, state }: { fixture: Fixture; state: LiveMatchState | null }) {
  const innings = state ? (state.currentInnings === 1 ? state.innings1 : state.innings2) : null;
  const chase =
    state && state.currentInnings === 2 && innings
      ? computeChase(computeTarget(state.innings1.totalRuns), innings, state.oversLimit)
      : null;
  const lastBalls = innings ? recentBallsDisplay(innings.completedOvers[innings.completedOvers.length - 1] ?? [], 6) : [];

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-md bg-red px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-white" />
          Live
        </span>
        <span className="truncate text-[10.5px] text-muted-2">{fixture.tournament.name}</span>
      </div>

      {state ? (
        <div className="flex flex-col gap-1.5">
          <ScoreRow name={state.innings1.battingTeam} innings={state.innings1} oversLimit={state.oversLimit} highlight={state.currentInnings === 1} />
          {state.innings2 && (
            <ScoreRow name={state.innings2.battingTeam} innings={state.innings2} oversLimit={state.oversLimit} highlight={state.currentInnings === 2} />
          )}
        </div>
      ) : (
        <p className="text-[13.5px] font-bold">{fixture.name}</p>
      )}

      {innings && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-muted">
          <span>
            CRR <b className="tabular-nums text-foreground">{inningsRunRate(innings).toFixed(2)}</b>
          </span>
          {chase && (
            <>
              <span>
                Need <b className="tabular-nums text-wood">{chase.runsRequired}{chase.ballsRemaining !== null ? ` off ${chase.ballsRemaining}` : ""}</b>
              </span>
              {chase.requiredRunRate !== null && (
                <span>
                  RRR <b className="tabular-nums text-red">{chase.requiredRunRate.toFixed(2)}</b>
                </span>
              )}
            </>
          )}
        </div>
      )}

      {lastBalls.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-muted-2">Last over</span>
          {lastBalls.map((b, i) => (
            <span
              key={i}
              className={cn(
                "flex h-5 w-5 flex-none items-center justify-center rounded-full text-[9px] font-bold",
                b.isWicket ? "bg-red/20 text-red" : b.isBoundary ? "bg-wood/20 text-wood" : "bg-surface-3 text-muted"
              )}
            >
              {b.label}
            </span>
          ))}
        </div>
      )}

      <p className="truncate text-[10.5px] text-muted-2">{venueLabel(fixture.venue)}</p>

      <div className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/matches/${fixture.id}/live`}>Continue Scoring</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/matches/${fixture.id}`}>View Match</Link>
        </Button>
      </div>
    </Card>
  );
}

function ScoreRow({
  name,
  innings,
  oversLimit,
  highlight,
}: {
  name: string;
  innings: LiveMatchState["innings1"];
  oversLimit: number | null;
  highlight: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn("min-w-0 truncate text-[13px]", highlight ? "font-extrabold" : "font-semibold text-muted")}>{name}</span>
      <span className={cn("tabular-nums flex-none text-[15px] font-extrabold", !highlight && "text-muted")}>
        {innings.totalRuns}/{innings.totalWickets}
        <span className="ml-1.5 text-[10px] font-semibold text-muted-2">
          {oversLabel(innings.legalBalls)}
          {oversLimit ? `/${oversLimit}` : ""} ov
        </span>
      </span>
    </div>
  );
}

export function UpcomingMatchCard({ fixture }: { fixture: Fixture }) {
  const [teamA, teamB] = fixture.teams ?? [];
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-md bg-blue/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-blue">Upcoming</span>
        <span className="truncate text-[10.5px] text-muted-2">{fixture.tournament.name}</span>
      </div>

      <p className="text-[13.5px] font-bold">{teamA && teamB ? `${teamA.name} vs ${teamB.name}` : fixture.name}</p>

      <div className="flex items-center gap-3 text-[10.5px] text-muted">
        <span>{formatDateShort(fixture.date, fixture.startTime)}</span>
        <span className="text-wood">{daysUntil(fixture.date, fixture.startTime)}</span>
      </div>

      <p className="truncate text-[10.5px] text-muted-2">{venueLabel(fixture.venue)}</p>

      <Button asChild variant="outline">
        <Link href={`/matches/${fixture.id}`}>View Match</Link>
      </Button>
    </Card>
  );
}

export function CompletedMatchCard({ summary, hasScorecard }: { summary: MatchSummary; hasScorecard: boolean }) {
  const card = (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-md border border-border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-muted">
          {summary.status}
        </span>
        <span className="text-[10.5px] text-muted-2">{summary.date}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-[13px] font-semibold">{summary.teamA}</span>
          <span className="tabular-nums flex-none text-[13.5px] font-bold">{summary.scoreA ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-[13px] font-semibold">{summary.teamB}</span>
          <span className="tabular-nums flex-none text-[13.5px] font-bold">{summary.scoreB ?? "—"}</span>
        </div>
      </div>

      {summary.result && <p className="text-[11.5px] font-semibold text-wood">{summary.result}</p>}
      <p className="truncate text-[10.5px] text-muted-2">{summary.venue}</p>

      {hasScorecard && (
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm" className="flex-1">
            <Link href={`/matches/${summary.id}/scorecard`}>Scorecard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="flex-1">
            <Link href={`/matches/${summary.id}`}>Statistics</Link>
          </Button>
          <Button variant="ghost" size="sm" className="flex-none px-3" aria-label="Share result">
            <Share2 size={14} />
          </Button>
        </div>
      )}
    </Card>
  );

  return card;
}
