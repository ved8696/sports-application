import { SectionLabel } from "@/components/mobile/section-label";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TeamComparison } from "@/components/scorecard/team-comparison";
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
import type { LiveMatchState } from "@/lib/liveScoring/types";

const FUTURE_VISUALS = [
  { title: "Pitch Map", description: "Line & length heat map -- coming soon" },
  { title: "Shot Map", description: "Where every run was scored -- coming soon" },
  { title: "Bowling Heat Map", description: "Pressure zones by bowler -- coming soon" },
  { title: "Win Probability", description: "Ball-by-ball win odds -- coming soon" },
];

// The chart/comparison half of what the standalone /matches/[id]/scorecard
// page already builds -- reuses every component verbatim, just grouped
// under its own tab instead of stacked below the raw batting/bowling tables
// (which stay in the sibling "Scorecard" tab).
export function StatisticsTab({ state }: { state: LiveMatchState }) {
  const hasAnyBalls = state.innings1.legalBalls > 0;
  const b1 = boundaryCounts(state.innings1);
  const b2 = state.innings2 ? boundaryCounts(state.innings2) : { fours: 0, sixes: 0 };
  const hasBoundaries = b1.fours + b1.sixes + b2.fours + b2.sixes > 0;
  const hasWickets = state.innings1.fallOfWickets.length > 0 || (state.innings2?.fallOfWickets.length ?? 0) > 0;

  if (!hasAnyBalls) {
    return <p className="py-10 text-center text-xs text-muted">Statistics unlock once the first over is bowled.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <TeamComparison innings1={state.innings1} innings2={state.innings2} />
      </section>

      <section>
        <RunRateGraph
          innings1={cumulativeRunsByOver(state.innings1)}
          innings2={state.innings2 ? cumulativeRunsByOver(state.innings2) : []}
        />
      </section>

      <section>
        <SectionLabel>Batting Comparison</SectionLabel>
        <BattingComparisonChart innings1={state.innings1} innings2={state.innings2} />
      </section>

      <section>
        <BowlingComparison innings1={state.innings1} innings2={state.innings2} />
      </section>

      <section>
        <SectionLabel>Manhattan · Runs per Over</SectionLabel>
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

      {state.report && (
        <section>
          <MatchReportCard report={state.report} />
        </section>
      )}

      <section>
        <SectionLabel>Future Visualisations</SectionLabel>
        <div className="flex flex-col gap-2.5">
          <WagonWheelPlaceholder />
          <div className="grid grid-cols-2 gap-2.5">
            {FUTURE_VISUALS.map((v) => (
              <Card key={v.title} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{v.title}</CardTitle>
                  <CardDescription>{v.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {state.status === "completed" && (
        <section>
          <ExportActions state={state} />
        </section>
      )}
    </div>
  );
}
