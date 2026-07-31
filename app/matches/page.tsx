"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Swords, CalendarClock, Trophy } from "lucide-react";
import { EmptyState, LoadingState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ScreenHeader, ScreenBody } from "@/components/mobile/app-screen";
import { SectionLabel } from "@/components/mobile/section-label";
import { SearchAiButton } from "@/components/search/search-ai-button";
import { LiveMatchCard, UpcomingMatchCard, CompletedMatchCard } from "@/components/matches/match-list-card";
import { useCricketDashboard } from "@/lib/cricket/useCricketDashboard";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useLiveSnapshots } from "@/lib/matches/useLiveSnapshots";
import { matchesSearch } from "@/lib/cricket/helpers";

type Filter = "all" | "live" | "upcoming" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

export default function MatchesPage() {
  const { status, matchSummaries } = useCricketDashboard();
  const { fixtures, status: fixtureStatus, load: loadFixtures } = useFixtureStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    loadFixtures();
  }, [loadFixtures]);

  const liveFixtures = useMemo(() => fixtures.filter((f) => f.status === "Live"), [fixtures]);
  const upcomingFixtures = useMemo(
    () => fixtures.filter((f) => f.status === "Scheduled").sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)),
    [fixtures]
  );
  const liveSnapshots = useLiveSnapshots(liveFixtures.map((f) => f.id));

  const filteredLive = liveFixtures.filter((f) => matchesSearch([f.name, f.tournament.name, f.venue.name], query));
  const filteredUpcoming = upcomingFixtures.filter((f) => matchesSearch([f.name, f.tournament.name, f.venue.name], query));
  const filteredCompleted = matchSummaries.filter((m) => matchesSearch([m.teamA, m.teamB, m.venue], query));

  const showLive = filter === "all" || filter === "live";
  const showUpcoming = filter === "all" || filter === "upcoming";
  const showCompleted = filter === "all" || filter === "completed";

  const nothingToShow =
    (!showLive || filteredLive.length === 0) &&
    (!showUpcoming || filteredUpcoming.length === 0) &&
    (!showCompleted || filteredCompleted.length === 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader title="Match Centre" trailing={<SearchAiButton />} />

      <div className="flex-none px-5 pb-3">
        <div className="relative mb-3">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search matches, teams, venues…" className="pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={
                "flex-none rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold " +
                (filter === f.value
                  ? f.value === "live"
                    ? "border-red bg-red text-white"
                    : "border-foreground bg-foreground text-background"
                  : "border-border text-muted")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ScreenBody>
        <div className="flex flex-col gap-6">
          {showLive && filteredLive.length > 0 && (
            <section>
              <SectionLabel>Live Now · {filteredLive.length}</SectionLabel>
              <div className="flex flex-col gap-2.5">
                {filteredLive.map((f) => (
                  <LiveMatchCard key={f.id} fixture={f} state={liveSnapshots[f.id] ?? null} />
                ))}
              </div>
            </section>
          )}

          {showUpcoming && (
            <section>
              <SectionLabel>Upcoming</SectionLabel>
              {fixtureStatus === "loading" ? (
                <LoadingState label="Loading fixtures…" size="compact" />
              ) : filteredUpcoming.length === 0 ? (
                <EmptyState icon={CalendarClock} title="No upcoming matches" size="compact" />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {filteredUpcoming.map((f) => (
                    <UpcomingMatchCard key={f.id} fixture={f} />
                  ))}
                </div>
              )}
            </section>
          )}

          {showCompleted && (
            <section>
              <SectionLabel>Completed</SectionLabel>
              {status !== "ready" ? (
                <LoadingState label="Loading results…" />
              ) : filteredCompleted.length === 0 ? (
                <EmptyState icon={Trophy} title="No completed matches" size="compact" />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {filteredCompleted.map((m) => (
                    <CompletedMatchCard key={m.id} summary={m} hasScorecard={m.id.startsWith("fixture-")} />
                  ))}
                </div>
              )}
            </section>
          )}

          {nothingToShow && status === "ready" && fixtureStatus !== "loading" && (
            <EmptyState
              icon={Swords}
              title={query ? "No matches match your search" : "No matches yet"}
              description={query ? "Try a different team, venue or tournament." : "Scheduled, live and completed matches will show up here."}
            />
          )}
        </div>
      </ScreenBody>
    </div>
  );
}
