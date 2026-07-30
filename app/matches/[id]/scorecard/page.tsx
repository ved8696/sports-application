"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useLiveScoringStore } from "@/lib/store/live-scoring-store";
import { MatchResultBanner } from "@/components/scorecard/match-result-banner";
import { PotmCard } from "@/components/scorecard/potm-card";
import { TeamComparison } from "@/components/scorecard/team-comparison";
import { InningsSummary } from "@/components/live-scoring/innings-summary";
import { RunRateGraph } from "@/components/scorecard/run-rate-graph";
import { BattingComparisonChart } from "@/components/scorecard/batting-comparison-chart";
import { BowlingComparison } from "@/components/scorecard/bowling-comparison";
import { OverComparison } from "@/components/scorecard/over-comparison";
import { BoundaryBreakdown } from "@/components/scorecard/boundary-breakdown";
import { WicketTimeline } from "@/components/scorecard/wicket-timeline";
import { WagonWheelPlaceholder } from "@/components/scorecard/wagon-wheel-placeholder";
import { MatchReportCard } from "@/components/scorecard/match-report";
import { ExportActions } from "@/components/scorecard/export-actions";
import { boundaryCounts, cumulativeRunsByOver } from "@/lib/liveScoring/scoreboard";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 border-l-2 border-wood pl-2 text-[11px] font-bold uppercase tracking-wide text-wood">{children}</p>;
}

export default function ScorecardPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { fixtures, load: loadFixtures } = useFixtureStore();
  const { state, status, error, load } = useLiveScoringStore();

  useEffect(() => {
    loadFixtures();
  }, [loadFixtures]);

  useEffect(() => {
    if (fixtureId) load(fixtureId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId]);

  useEffect(() => {
    // Someone landed here mid-match (e.g. a stale bookmark) -- the live page is the right place for that.
    if (state && state.status !== "completed") router.replace(`/matches/${fixtureId}/live`);
  }, [state, fixtureId, router]);

  const fixture = fixtures.find((f) => f.id === fixtureId) ?? null;

  const hasWickets = Boolean(state && (state.innings1.fallOfWickets.length > 0 || (state.innings2?.fallOfWickets.length ?? 0) > 0));
  const hasBoundaries = (() => {
    if (!state) return false;
    const b1 = boundaryCounts(state.innings1);
    const b2 = state.innings2 ? boundaryCounts(state.innings2) : { fours: 0, sixes: 0 };
    return b1.fours + b1.sixes + b2.fours + b2.sixes > 0;
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center gap-3 px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <Link
          href="/matches"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="truncate text-lg font-extrabold">Scorecard</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {(status === "idle" || status === "loading" || !fixture) && (
          <Card className="flex items-center justify-center gap-2.5 py-16 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-blue" />
            Loading scorecard…
          </Card>
        )}

        {(status === "error" || status === "not-started") && (
          <Card className="flex flex-col items-center gap-2 py-16 text-center">
            <AlertTriangle size={18} className="text-red" />
            <p className="text-sm font-semibold">Scorecard not available</p>
            <p className="text-xs text-muted">{error ?? "This match hasn't been played yet."}</p>
          </Card>
        )}

        {status === "ready" && state && fixture && state.status === "completed" && (
          <div className="flex flex-col gap-6">
            <section>
              {state.result && <MatchResultBanner result={state.result} matchName={fixture.name} tournament={fixture.tournament.name} />}
            </section>

            {state.potm && (
              <section>
                <PotmCard potm={state.potm} />
              </section>
            )}

            <section>
              <SectionLabel>Team Comparison</SectionLabel>
              <TeamComparison innings1={state.innings1} innings2={state.innings2} />
            </section>

            <section>
              <SectionLabel>{state.innings1.battingTeam} Innings</SectionLabel>
              <InningsSummary innings={state.innings1} />
            </section>

            {state.innings2 && (
              <section>
                <SectionLabel>{state.innings2.battingTeam} Innings</SectionLabel>
                <InningsSummary innings={state.innings2} />
              </section>
            )}

            <section>
              <SectionLabel>Run Rate Progression</SectionLabel>
              <RunRateGraph innings1={cumulativeRunsByOver(state.innings1)} innings2={state.innings2 ? cumulativeRunsByOver(state.innings2) : []} />
            </section>

            <section>
              <SectionLabel>Batting Comparison</SectionLabel>
              <BattingComparisonChart innings1={state.innings1} innings2={state.innings2} />
            </section>

            <section>
              <BowlingComparison innings1={state.innings1} innings2={state.innings2} />
            </section>

            <section>
              <SectionLabel>Over Comparison</SectionLabel>
              <OverComparison innings1={state.innings1} innings2={state.innings2} format={state.format} />
            </section>

            {hasBoundaries && (
              <section>
                <SectionLabel>Boundary Breakdown</SectionLabel>
                <BoundaryBreakdown innings1={state.innings1} innings2={state.innings2} />
              </section>
            )}

            {hasWickets && (
              <section>
                <WicketTimeline innings1={state.innings1} innings2={state.innings2} />
              </section>
            )}

            <section>
              <SectionLabel>Shot Placement</SectionLabel>
              <WagonWheelPlaceholder />
            </section>

            {state.report && (
              <section>
                <MatchReportCard report={state.report} />
              </section>
            )}

            <section>
              <ExportActions state={state} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
