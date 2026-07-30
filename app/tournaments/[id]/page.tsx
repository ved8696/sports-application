"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useTournamentStore } from "@/lib/store/tournament-store";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useCricketStore } from "@/lib/store/cricket-store";
import { computeStandings } from "@/lib/tournament/standings";
import { OverviewTab } from "@/components/tournament/overview-tab";
import { TeamsTab } from "@/components/tournament/teams-tab";
import { FixturesTab } from "@/components/tournament/fixtures-tab";
import { TableTab } from "@/components/tournament/table-tab";
import { StatsTab } from "@/components/tournament/stats-tab";

type TabKey = "overview" | "teams" | "fixtures" | "table" | "stats";

export default function TournamentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { tournaments, status, error, load } = useTournamentStore();
  const { fixtures, load: loadFixtures, reload: reloadFixtures } = useFixtureStore();
  const { matches, load: loadMatches, reload: reloadMatches } = useCricketStore();
  const [tab, setTab] = useState<TabKey>((searchParams.get("tab") as TabKey) || "overview");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    load();
    loadFixtures();
    loadMatches();
  }, [load, loadFixtures, loadMatches]);

  // Standings/analytics depend on freshly archived match history -- refetch
  // once on entry so a match completed earlier in the session (which only
  // updates the server's data, not this cached client store) shows up
  // without requiring a hard page reload.
  useEffect(() => {
    reloadFixtures();
    reloadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tournament = tournaments.find((t) => t.id === id);
  const tournamentFixtures = useMemo(() => fixtures.filter((f) => f.tournamentId === id), [fixtures, id]);
  const standings = useMemo(
    () =>
      tournament
        ? computeStandings(
            tournament.name,
            tournament.teams.map((t) => t.name),
            tournamentFixtures,
            matches,
            tournament.format === "league" ? 0 : Math.min(4, tournament.teams.length)
          )
        : [],
    [tournament, tournamentFixtures, matches]
  );

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 size={20} className="animate-spin text-blue" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <AlertTriangle size={18} className="text-red" />
        <p className="text-sm font-semibold">Couldn&apos;t load this tournament</p>
        <p className="text-xs text-muted">{error}</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-semibold">Tournament not found</p>
        <Link href="/tournaments" className="text-xs font-semibold text-blue">
          Back to Tournaments
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center gap-3 px-5 pb-3" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <Link href="/tournaments" className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold">{tournament.name}</h1>
        <button type="button" onClick={() => setMenuOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted" aria-label="More options">
          <MoreHorizontal size={16} />
        </button>
      </header>

      <div className="flex-none px-5 pb-3">
        <Card className="flex items-center gap-2.5 p-3">
          <div className="h-11 w-11 flex-none rounded-[10px] bg-surface-3" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold">{tournament.name}</p>
            <p className="truncate text-[11px] text-muted-2">{tournament.teams.length} Teams · {tournament.startDate} – {tournament.endDate}</p>
          </div>
          <span className={`flex-none rounded-lg px-2 py-0.5 text-[9px] font-bold ${tournament.status === "Active" ? "bg-foreground text-background" : "border border-border text-muted"}`}>
            {tournament.status === "Active" ? "LIVE" : tournament.status.toUpperCase()}
          </span>
        </Card>
      </div>

      <Tabs
        options={[
          { value: "overview", label: "Overview" },
          { value: "teams", label: "Teams" },
          { value: "fixtures", label: "Fixtures" },
          { value: "table", label: "Table" },
          { value: "stats", label: "Stats" },
        ]}
        value={tab}
        onChange={(v) => {
          setTab(v);
          router.replace(`/tournaments/${id}?tab=${v}`, { scroll: false });
        }}
      />

      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        {tab === "overview" && <OverviewTab tournament={tournament} fixtures={tournamentFixtures} standings={standings} />}
        {tab === "teams" && <TeamsTab tournament={tournament} standings={standings} />}
        {tab === "fixtures" && <FixturesTab tournament={tournament} fixtures={tournamentFixtures} matches={matches} />}
        {tab === "table" && <TableTab standings={standings} />}
        {tab === "stats" && <StatsTab tournamentName={tournament.name} />}
      </div>

      <BottomSheet open={menuOpen} onOpenChange={setMenuOpen} title={tournament.name}>
        <div className="flex flex-col gap-1 pb-2">
          <Link href={`/tournaments/${id}/reports`} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-3 text-[13px] font-semibold">
            Reports
          </Link>
          <Link href={`/tournaments/${id}/settings`} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-3 text-[13px] font-semibold">
            Settings
          </Link>
        </div>
      </BottomSheet>
    </div>
  );
}
