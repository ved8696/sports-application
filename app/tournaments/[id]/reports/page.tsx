"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Download, Trophy, TrendingUp, Users, Target, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchAiButton } from "@/components/search/search-ai-button";
import { useTournamentStore } from "@/lib/store/tournament-store";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useCricketStore } from "@/lib/store/cricket-store";
import { applyFilters, defaultFilterState } from "@/lib/cricket/filters";
import { computeBatterStats, computeKpis } from "@/lib/cricket/aggregations";
import { computeBowlingFigures, computePartnerships } from "@/lib/tournament/reports";
import { computeStandings } from "@/lib/tournament/standings";

type ReportKey = "summary" | "performers" | "partnerships" | "bowling" | "champion";

const REPORTS: { key: ReportKey; icon: typeof Trophy; title: string; subtitle: string }[] = [
  { key: "summary", icon: TrendingUp, title: "Tournament Summary", subtitle: "Full stats & highlights" },
  { key: "performers", icon: Users, title: "Top Performers", subtitle: "Runs, wickets, catches" },
  { key: "partnerships", icon: Target, title: "Highest Partnerships", subtitle: "Top batting pairs" },
  { key: "bowling", icon: Medal, title: "Best Bowling Figures", subtitle: "Best spells per match" },
  { key: "champion", icon: Trophy, title: "Champion & Runner-up", subtitle: "Final standings" },
];

export default function TournamentReportsPage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const { tournaments, load } = useTournamentStore();
  const { fixtures, load: loadFixtures } = useFixtureStore();
  const { matches, playerBios, load: loadMatches } = useCricketStore();
  const [open, setOpen] = useState<ReportKey | null>(null);

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
  const partnerships = useMemo(() => computePartnerships(filtered.deliveries), [filtered.deliveries]);
  const standings = useMemo(
    () => (tournament ? computeStandings(tournament.name, tournament.teams.map((t) => t.name), tournamentFixtures, matches, Math.min(4, tournament.teams.length)) : []),
    [tournament, tournamentFixtures, matches]
  );

  const topScorer = [...batterStats].sort((a, b) => b.runs - a.runs)[0];
  const topWicketTaker = useMemo(() => {
    const totals = new Map<string, number>();
    for (const f of bowlingFigures) totals.set(f.bowler, (totals.get(f.bowler) ?? 0) + f.wickets);
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1])[0];
  }, [bowlingFigures]);

  if (!tournament) return null;

  function toggle(key: ReportKey) {
    setOpen((o) => (o === key ? null : key));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center gap-3 px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <Link href={`/tournaments/${id}`} className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="flex-1 text-lg font-extrabold">Reports</h1>
        <SearchAiButton />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <div className="flex flex-col gap-2">
          {REPORTS.map(({ key, icon: Icon, title, subtitle }) => (
            <div key={key} className="rounded-xl border border-border">
              <button type="button" onClick={() => toggle(key)} className="flex w-full items-center gap-2.5 p-2.5 text-left">
                <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-surface-3">
                  <Icon size={15} className="text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold">{title}</p>
                  <p className="text-[10px] text-muted-2">{subtitle}</p>
                </div>
                <ChevronDown size={15} className={`flex-none text-muted-2 transition-transform ${open === key ? "rotate-180" : ""}`} />
              </button>

              {open === key && (
                <div className="border-t border-border px-3 pb-3 pt-2.5 text-[11.5px]">
                  {key === "summary" && (
                    <div className="flex flex-col gap-1.5">
                      <Row label="Matches Played" value={String(filtered.matches.length)} />
                      <Row label="Total Runs" value={String(kpis.find((k) => k.label === "Total Runs")?.value ?? 0)} />
                      <Row label="Wickets" value={String(kpis.find((k) => k.label === "Wickets Lost")?.value ?? 0)} />
                    </div>
                  )}
                  {key === "performers" && (
                    <div className="flex flex-col gap-1.5">
                      <Row label="Most Runs" value={topScorer ? `${topScorer.player} · ${topScorer.runs}` : "—"} />
                      <Row label="Most Wickets" value={topWicketTaker ? `${topWicketTaker[0]} · ${topWicketTaker[1]}` : "—"} />
                    </div>
                  )}
                  {key === "partnerships" && (
                    <div className="flex flex-col gap-1.5">
                      {partnerships.slice(0, 3).map((p, i) => (
                        <Row key={i} label={`${p.batterA} & ${p.batterB}`} value={`${p.runs} runs`} />
                      ))}
                      {partnerships.length === 0 && <p className="text-muted-2">No partnerships yet.</p>}
                    </div>
                  )}
                  {key === "bowling" && (
                    <div className="flex flex-col gap-1.5">
                      {bowlingFigures.slice(0, 3).map((f, i) => (
                        <Row key={i} label={f.bowler} value={`${f.wickets}/${f.runsConceded}`} />
                      ))}
                      {bowlingFigures.length === 0 && <p className="text-muted-2">No bowling figures yet.</p>}
                    </div>
                  )}
                  {key === "champion" && (
                    <div className="flex flex-col gap-1.5">
                      <Row label="Champion" value={standings[0]?.team ?? "TBD"} />
                      <Row label="Runner-up" value={standings[1]?.team ?? "TBD"} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-none px-5" style={{ paddingBottom: "calc(var(--safe-bottom) + 16px)" }}>
        <Button variant="outline" onClick={() => window.print()}>
          <Download size={15} /> Download All Reports
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
