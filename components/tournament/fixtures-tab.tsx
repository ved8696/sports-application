"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/tabs";
import { FixtureCard } from "./fixture-card";
import { CreateMatchSheet } from "./create-match-sheet";
import { useTournamentStore } from "@/lib/store/tournament-store";
import { advanceKnockoutRound, isRoundComplete, KNOCKOUT_ROUND_ORDER } from "@/lib/tournament/bracket";
import type { Fixture } from "@/lib/cricket/fixture-types";
import type { Match } from "@/lib/cricket/types";
import type { Tournament } from "@/lib/tournament/types";

type ViewMode = "list" | "calendar" | "round" | "knockout";

function venueDateSort(a: Fixture, b: Fixture) {
  return `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`);
}

export function FixturesTab({ tournament, fixtures, matches }: { tournament: Tournament; fixtures: Fixture[]; matches: Match[] }) {
  const [view, setView] = useState<ViewMode>("list");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { generateFixtures, advanceKnockout } = useTournamentStore();

  const sorted = useMemo(() => [...fixtures].sort(venueDateSort), [fixtures]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateFixtures(tournament.id);
    } finally {
      setGenerating(false);
    }
  }

  if (!tournament.fixturesGenerated) {
    return (
      <div className="px-5 pt-4">
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <p className="text-sm font-semibold">No fixtures yet</p>
          <p className="max-w-[220px] text-xs text-muted">
            Automatically generate the {tournament.format === "knockout" ? "knockout bracket" : "round-robin schedule"} for {tournament.teams.length} teams.
          </p>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating…" : "Generate Fixtures"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-3">
        <span className="text-[11px] font-semibold text-muted-2">{fixtures.length} matches</span>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="rounded-xl border border-border px-2.5 py-1 text-[10px] font-bold"
        >
          + New
        </button>
      </div>

      <PillTabs
        options={[
          { value: "list", label: "List" },
          { value: "calendar", label: "Calendar" },
          { value: "round", label: "Round" },
          { value: "knockout", label: "Knockout" },
        ]}
        value={view}
        onChange={setView}
      />

      <div className="flex flex-col gap-2.5 px-5 pb-4">
        {view === "list" && sorted.map((f) => <FixtureCard key={f.id} fixture={f} />)}

        {view === "calendar" && <CalendarView fixtures={sorted} />}

        {view === "round" && <RoundView fixtures={sorted} />}

        {view === "knockout" && (
          <KnockoutView tournament={tournament} fixtures={fixtures} matches={matches} onAdvance={(pairings) => advanceKnockout(tournament.id, pairings)} />
        )}

        {sorted.length === 0 && <p className="py-8 text-center text-xs text-muted">No matches in this tournament yet.</p>}
      </div>

      <CreateMatchSheet tournament={tournament} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

function CalendarView({ fixtures }: { fixtures: Fixture[] }) {
  const byDate = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    if (!byDate.has(f.date)) byDate.set(f.date, []);
    byDate.get(f.date)!.push(f);
  }
  return (
    <>
      {Array.from(byDate.entries()).map(([date, group]) => (
        <div key={date}>
          <p className="mb-1.5 mt-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">
            {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </p>
          <div className="flex flex-col gap-2.5">
            {group.map((f) => (
              <FixtureCard key={f.id} fixture={f} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function RoundView({ fixtures }: { fixtures: Fixture[] }) {
  const byRound = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const round = f.round ?? "Unscheduled";
    if (!byRound.has(round)) byRound.set(round, []);
    byRound.get(round)!.push(f);
  }
  return (
    <>
      {Array.from(byRound.entries()).map(([round, group]) => (
        <div key={round}>
          <p className="mb-1.5 mt-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">{round}</p>
          <div className="flex flex-col gap-2.5">
            {group.map((f) => (
              <FixtureCard key={f.id} fixture={f} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function findWinner(matches: Match[], tournamentName: string, teamA: string, teamB: string): string | undefined {
  const match = matches.find((m) => m.tournament.name === tournamentName && m.teams.includes(teamA) && m.teams.includes(teamB));
  return match?.result.winner;
}

function KnockoutView({
  tournament,
  fixtures,
  matches,
  onAdvance,
}: {
  tournament: Tournament;
  fixtures: Fixture[];
  matches: Match[];
  onAdvance: (pairings: ReturnType<typeof advanceKnockoutRound>) => void;
}) {
  const [advancing, setAdvancing] = useState(false);
  const knockoutFixtures = fixtures.filter((f) => f.round && KNOCKOUT_ROUND_ORDER.includes(f.round));
  const roundsPresent = KNOCKOUT_ROUND_ORDER.filter((r) => knockoutFixtures.some((f) => f.round === r));

  if (knockoutFixtures.length === 0) {
    return <p className="py-8 text-center text-xs text-muted">No knockout matches yet.</p>;
  }

  const lastRound = roundsPresent[roundsPresent.length - 1];
  const canAdvance = lastRound !== "Final" && isRoundComplete(knockoutFixtures, lastRound);

  async function handleAdvance() {
    setAdvancing(true);
    try {
      const winnerByFixtureId: Record<string, string> = {};
      for (const f of knockoutFixtures.filter((fx) => fx.round === lastRound)) {
        const [a, b] = f.teams ?? [];
        if (!a || !b) continue;
        const winner = findWinner(matches, tournament.name, a.name, b.name);
        if (winner) winnerByFixtureId[f.id] = winner;
      }
      const pairings = advanceKnockoutRound(knockoutFixtures, lastRound, winnerByFixtureId);
      onAdvance(pairings);
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {roundsPresent.map((round) => (
        <div key={round}>
          <p className="mb-1.5 mt-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">{round}</p>
          <div className="flex flex-col gap-1.5">
            {knockoutFixtures
              .filter((f) => f.round === round)
              .map((f) => {
                const [a, b] = f.teams ?? [];
                const winner = a && b ? findWinner(matches, tournament.name, a.name, b.name) : undefined;
                return (
                  <div key={f.id} className="flex flex-col gap-0">
                    <BracketRow name={a?.name ?? "TBD"} isWinner={winner === a?.name} />
                    <BracketRow name={b?.name ?? "TBD"} isWinner={winner === b?.name} />
                  </div>
                );
              })}
          </div>
          {round !== "Final" && <div className="mx-auto my-1 h-4 w-px bg-border" />}
        </div>
      ))}

      {canAdvance && (
        <Button onClick={handleAdvance} disabled={advancing} className="mt-3">
          {advancing ? "Advancing…" : `Advance to ${lastRound === "Quarterfinal" ? "Semifinal" : "Final"}`}
        </Button>
      )}
    </div>
  );
}

function BracketRow({ name, isWinner }: { name: string; isWinner: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-[11px] ${isWinner ? "border-foreground font-bold" : "border-border text-muted"}`}>
      <span>{name}</span>
    </div>
  );
}
