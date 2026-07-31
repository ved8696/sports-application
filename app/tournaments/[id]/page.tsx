"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, MoreHorizontal, SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/empty-state";
import { ScreenHeader, ScreenBody } from "@/components/mobile/app-screen";
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

  if (status === "loading" || status === "idle" || status === "error" || !tournament) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <ScreenHeader backHref="/tournaments" title="Tournament" />
        <ScreenBody className="flex flex-col justify-center">
          {(status === "loading" || status === "idle") && <LoadingState label="Loading tournament…" />}
          {status === "error" && (
            <EmptyState icon={AlertTriangle} title="Couldn't load this tournament" description={error ?? undefined} tone="danger" />
          )}
          {status === "ready" && !tournament && (
            <EmptyState
              icon={SearchX}
              title="Tournament not found"
              description="This tournament may have been removed, or the link is incorrect."
              action={
                <Button size="sm" asChild>
                  <Link href="/tournaments">Back to Tournaments</Link>
                </Button>
              }
            />
          )}
        </ScreenBody>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader
        backHref="/tournaments"
        title={tournament.name}
        trailing={
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        }
      />

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
