"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, MapPin, CalendarClock, Trophy, Layers, SearchX, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState, LoadingState } from "@/components/ui/empty-state";
import { ScreenHeader, ScreenBody } from "@/components/mobile/app-screen";
import { MatchHeaderCard } from "@/components/matches/match-header-card";
import { LiveTab } from "@/components/matches/tabs/live-tab";
import { ScorecardTab } from "@/components/matches/tabs/scorecard-tab";
import { StatisticsTab } from "@/components/matches/tabs/statistics-tab";
import { PlayersTab } from "@/components/matches/tabs/players-tab";
import { CommentaryTab } from "@/components/matches/tabs/commentary-tab";
import { TimelineTab } from "@/components/matches/tabs/timeline-tab";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useLiveScoringStore } from "@/lib/store/live-scoring-store";
import { venueLabel } from "@/lib/matchCreation/defaults";
import { resumeSetupStep, setupStepPath } from "@/lib/matchSetup/types";

type TabKey = "live" | "scorecard" | "statistics" | "players" | "commentary" | "timeline";

const LIVE_TABS: { value: TabKey; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "scorecard", label: "Scorecard" },
  { value: "statistics", label: "Statistics" },
  { value: "players", label: "Players" },
  { value: "commentary", label: "Commentary" },
  { value: "timeline", label: "Timeline" },
];

const COMPLETED_TABS: { value: TabKey; label: string }[] = LIVE_TABS.filter((t) => t.value !== "live");

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(hhmm: string): string {
  if (!hhmm) return "—";
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function MatchDetailsScreen() {
  const params = useParams();
  const fixtureId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { fixtures, status: fixtureStatus, error: fixtureError, load: loadFixtures } = useFixtureStore();
  const { state, status: liveStatus, error: liveError, load: loadLive } = useLiveScoringStore();
  const [tab, setTab] = useState<TabKey | null>(null);

  useEffect(() => {
    loadFixtures();
  }, [loadFixtures]);

  const fixture = fixtures.find((f) => f.id === fixtureId) ?? null;
  const needsLiveData = fixture?.status === "Live" || fixture?.status === "Completed";

  useEffect(() => {
    if (fixtureId && needsLiveData) loadLive(fixtureId);
  }, [fixtureId, needsLiveData, loadLive]);

  const loadingFixture = fixtureStatus === "idle" || fixtureStatus === "loading";
  const notFound = fixtureStatus === "ready" && !fixture;

  if (loadingFixture || notFound || fixtureStatus === "error") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <ScreenHeader backHref="/matches" title="Match Details" />
        <ScreenBody className="flex flex-col justify-center">
          {loadingFixture && <LoadingState label="Loading match…" />}
          {fixtureStatus === "error" && (
            <EmptyState icon={AlertTriangle} title="Couldn't load this match" description={fixtureError ?? undefined} tone="danger" />
          )}
          {notFound && (
            <EmptyState
              icon={SearchX}
              title="Match not found"
              description="This fixture may have been removed, or the link is incorrect."
              action={
                <Button size="sm" asChild>
                  <Link href="/matches">Back to Matches</Link>
                </Button>
              }
            />
          )}
        </ScreenBody>
      </div>
    );
  }

  if (!fixture) return null;

  // Scheduled fixtures haven't started yet -- teams/XI/toss/openers are still
  // being set up, so there's no Live/Scorecard/Statistics/Players/Commentary/
  // Timeline data to show. Keep this exact overview + setup CTA unchanged.
  if (fixture.status === "Scheduled") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <ScreenHeader backHref="/matches" title="Match Details" />
        <ScreenBody>
          <div className="flex flex-col gap-5">
            <Card className="p-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-wood">{fixture.status}</p>
              <h2 className="mt-1 text-xl font-extrabold leading-tight">{fixture.name}</h2>
              <p className="mt-1 text-[12.5px] text-muted-2">{fixture.tournament.name}</p>
            </Card>

            <div className="grid grid-cols-2 gap-2.5">
              <Card className="p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-2">Format</p>
                <p className="mt-1 text-[14px] font-bold">{fixture.format}</p>
              </Card>
              <Card className="p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-2">Overs</p>
                <p className="mt-1 text-[14px] font-bold">{fixture.overs ?? "Unlimited"}</p>
              </Card>
            </div>

            <Card className="divide-y divide-white/[0.06] px-4">
              <InfoRow icon={Trophy} label="Tournament" value={fixture.tournament.name} />
              <InfoRow icon={MapPin} label="Venue" value={venueLabel(fixture.venue)} />
              <InfoRow icon={CalendarClock} label="Date & Time" value={`${formatDate(fixture.date)} · ${formatTime(fixture.startTime)}`} />
              <InfoRow icon={Layers} label="Match Type" value={fixture.matchType} />
            </Card>

            <Button asChild>
              <Link href={setupStepPath(fixture.id, resumeSetupStep(fixture))}>{fixture.toss ? "View Match Ready" : "Continue to Toss"}</Link>
            </Button>
          </div>
        </ScreenBody>
      </div>
    );
  }

  // Live or Completed -- the tabbed Match Centre hub.
  const availableTabs = fixture.status === "Live" ? LIVE_TABS : COMPLETED_TABS;
  const activeTab = tab && availableTabs.some((t) => t.value === tab) ? tab : availableTabs[0].value;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader backHref="/matches" title={fixture.name} subtitle={fixture.tournament.name} />

      <div className="flex-none px-5 pb-4">
        <MatchHeaderCard fixture={fixture} state={state} />
      </div>

      <Tabs options={availableTabs} value={activeTab} onChange={setTab} />

      <ScreenBody>
        {(liveStatus === "idle" || liveStatus === "loading") && <LoadingState label="Loading match data…" />}

        {(liveStatus === "error" || liveStatus === "not-started") && (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load live data"
            description={liveError ?? "This match's live data isn't available yet."}
            tone="danger"
          />
        )}

        {liveStatus === "ready" && state && (
          <>
            {activeTab === "live" && fixture.status === "Live" && <LiveTab state={state} fixtureId={fixture.id} />}
            {activeTab === "scorecard" && <ScorecardTab state={state} fixture={fixture} />}
            {activeTab === "statistics" && <StatisticsTab state={state} />}
            {activeTab === "players" && <PlayersTab fixture={fixture} state={state} />}
            {activeTab === "commentary" && <CommentaryTab state={state} />}
            {activeTab === "timeline" && <TimelineTab fixture={fixture} state={state} />}
          </>
        )}
      </ScreenBody>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] bg-wood/12 text-wood">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] text-muted-2">{label}</p>
        <p className="truncate text-[13px] font-semibold">{value}</p>
      </div>
    </div>
  );
}
