"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTournamentStore } from "@/lib/store/tournament-store";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useCricketStore } from "@/lib/store/cricket-store";
import { applyFilters, defaultFilterState } from "@/lib/cricket/filters";
import { computeBatterStats, computeKpis } from "@/lib/cricket/aggregations";
import { computeBowlingFigures } from "@/lib/tournament/reports";
import { computeStandings } from "@/lib/tournament/standings";
import { KNOCKOUT_ROUND_ORDER } from "@/lib/tournament/bracket";

export default function TournamentCompletePage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const { tournaments, load } = useTournamentStore();
  const { fixtures, load: loadFixtures } = useFixtureStore();
  const { matches, playerBios, load: loadMatches } = useCricketStore();

  useEffect(() => {
    load();
    loadFixtures();
    loadMatches();
  }, [load, loadFixtures, loadMatches]);

  const tournament = tournaments.find((t) => t.id === id);
  const tournamentFixtures = useMemo(() => fixtures.filter((f) => f.tournamentId === id), [fixtures, id]);

  const filtered = useMemo(
    () => (tournament ? applyFilters(matches, { ...defaultFilterState(), tournament: tournament.name }, playerBios) : { deliveries: [], matches: [] }),
    [matches, playerBios, tournament]
  );
  const baseline = useMemo(() => applyFilters(matches, defaultFilterState(), playerBios).deliveries, [matches, playerBios]);
  const kpis = useMemo(() => computeKpis(filtered.deliveries, baseline), [filtered.deliveries, baseline]);
  const batterStats = useMemo(() => computeBatterStats(filtered.deliveries, playerBios), [filtered.deliveries, playerBios]);
  const bowlingFigures = useMemo(() => computeBowlingFigures(filtered.deliveries), [filtered.deliveries]);
  const standings = useMemo(
    () => (tournament ? computeStandings(tournament.name, tournament.teams.map((t) => t.name), tournamentFixtures, matches, Math.min(4, tournament.teams.length)) : []),
    [tournament, tournamentFixtures, matches]
  );

  const finalFixture = tournamentFixtures.find((f) => f.round === "Final" && f.status === "Completed");
  const finalMatch = useMemo(() => {
    if (!finalFixture || !tournament) return null;
    const [a, b] = finalFixture.teams ?? [];
    if (!a || !b) return null;
    return matches.find((m) => m.tournament.name === tournament.name && m.teams.includes(a.name) && m.teams.includes(b.name)) ?? null;
  }, [finalFixture, tournament, matches]);

  const champion = finalMatch?.result.winner ?? standings[0]?.team ?? "TBD";
  const runnerUp = finalFixture
    ? finalFixture.teams?.find((t) => t.name !== champion)?.name
    : standings[1]?.team;

  const topScorer = [...batterStats].sort((a, b) => b.runs - a.runs)[0];
  const topWicketTaker = useMemo(() => {
    const totals = new Map<string, number>();
    for (const fig of bowlingFigures) totals.set(fig.bowler, (totals.get(fig.bowler) ?? 0) + fig.wickets);
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1])[0];
  }, [bowlingFigures]);

  if (!tournament) return null;

  const isKnockoutFormat = tournament.format !== "league";
  const finalPending = isKnockoutFormat && tournamentFixtures.some((f) => f.round && KNOCKOUT_ROUND_ORDER.includes(f.round)) && !finalFixture;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pb-6 pt-6 text-center" style={{ paddingTop: "calc(var(--safe-top) + 24px)" }}>
      <div className="mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-[15px] font-bold text-background">1st</div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-2">Champion</p>
      <h1 className="mb-1 mt-1 text-[22px] font-extrabold">{champion}</h1>
      <p className="mb-5 text-xs text-muted-2">Runner-up: {runnerUp ?? "TBD"}</p>

      {finalPending && (
        <p className="mb-5 rounded-lg border border-border px-3 py-2 text-[11px] text-muted">
          Provisional — based on current standings. Final result updates this once the Final is played.
        </p>
      )}

      <div className="mb-4.5 flex w-full gap-2">
        <div className="flex-1 rounded-xl border border-border p-2.5">
          <p className="text-base font-bold">{filtered.matches.length}</p>
          <p className="text-[9px] text-muted-2">Matches</p>
        </div>
        <div className="flex-1 rounded-xl border border-border p-2.5">
          <p className="text-base font-bold">{kpis.find((k) => k.label === "Total Runs")?.value ?? 0}</p>
          <p className="text-[9px] text-muted-2">Total Runs</p>
        </div>
        <div className="flex-1 rounded-xl border border-border p-2.5">
          <p className="text-base font-bold">{kpis.find((k) => k.label === "Wickets Lost")?.value ?? 0}</p>
          <p className="text-[9px] text-muted-2">Wickets</p>
        </div>
      </div>

      <div className="mb-4.5 w-full text-left">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">Awards</p>
        <div className="flex flex-col gap-1.5">
          <AwardRow label="Player of Tournament" value={topScorer?.player ?? "—"} />
          <AwardRow label="Best Batsman" value={topScorer?.player ?? "—"} />
          <AwardRow label="Best Bowler" value={topWicketTaker?.[0] ?? "—"} />
        </div>
      </div>

      <Button asChild className="mb-2 w-full">
        <Link href={`/tournaments/${id}/reports`}>
          <Download size={15} /> Download Reports
        </Link>
      </Button>
      <Link href="/tournaments" className="text-[11px] font-semibold text-muted-2">
        Back to Dashboard
      </Link>
    </div>
  );
}

function AwardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-lg border border-border px-2.5 py-2 text-[11px] font-semibold">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
