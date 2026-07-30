"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FixtureCard } from "./fixture-card";
import { useTournamentStore } from "@/lib/store/tournament-store";
import type { Fixture } from "@/lib/cricket/fixture-types";
import type { StandingsRow } from "@/lib/tournament/standings";
import type { Tournament } from "@/lib/tournament/types";

export function OverviewTab({ tournament, fixtures, standings }: { tournament: Tournament; fixtures: Fixture[]; standings: StandingsRow[] }) {
  const router = useRouter();
  const { updateTournament } = useTournamentStore();
  const [finishing, setFinishing] = useState(false);

  const played = fixtures.filter((f) => f.status === "Completed").length;
  const remaining = fixtures.length - played;
  const rounds = Array.from(new Set(fixtures.map((f) => f.round).filter(Boolean)));
  const nextMatch = fixtures.find((f) => f.status === "Scheduled" || f.status === "Live");
  const allPlayed = fixtures.length > 0 && remaining === 0;

  async function handleFinish() {
    setFinishing(true);
    try {
      if (tournament.status !== "Completed") await updateTournament(tournament.id, { status: "Completed" });
      router.push(`/tournaments/${tournament.id}/complete`);
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      {rounds.length > 0 && (
        <div>
          <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-muted">
            <span>
              Round {rounds.length} of {rounds.length}
            </span>
            <span>{fixtures.length > 0 ? Math.round((played / fixtures.length) * 100) : 0}%</span>
          </div>
          <div className="h-[5px] rounded-full bg-surface-3">
            <div
              className="h-[5px] rounded-full bg-foreground"
              style={{ width: `${fixtures.length > 0 ? (played / fixtures.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Card className="flex-1 p-2.5 text-center">
          <p className="text-base font-bold">{played}</p>
          <p className="text-[9px] font-medium text-muted-2">Played</p>
        </Card>
        <Card className="flex-1 p-2.5 text-center">
          <p className="text-base font-bold">{remaining}</p>
          <p className="text-[9px] font-medium text-muted-2">Remaining</p>
        </Card>
        <Card className="flex-1 p-2.5 text-center">
          <p className="truncate text-base font-bold">{standings[0]?.team ?? "—"}</p>
          <p className="text-[9px] font-medium text-muted-2">Top Team</p>
        </Card>
      </div>

      {nextMatch ? (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-2">Next Match</p>
          <FixtureCard fixture={nextMatch} />
        </div>
      ) : !tournament.fixturesGenerated ? (
        <Card className="flex flex-col items-center gap-1 py-8 text-center text-sm text-muted">
          No fixtures yet.
          <Link href={`/tournaments/${tournament.id}?tab=fixtures`} className="text-xs font-semibold text-blue">
            Generate fixtures →
          </Link>
        </Card>
      ) : (
        <Card className="py-8 text-center text-sm text-muted">All matches completed.</Card>
      )}

      {allPlayed && (
        <Button onClick={handleFinish} disabled={finishing}>
          {finishing ? "Finishing…" : tournament.status === "Completed" ? "View Champion" : "Finish Tournament"}
        </Button>
      )}
    </div>
  );
}
