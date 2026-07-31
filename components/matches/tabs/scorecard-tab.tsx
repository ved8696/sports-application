import { SectionLabel } from "@/components/mobile/section-label";
import { MatchResultBanner } from "@/components/scorecard/match-result-banner";
import { PotmCard } from "@/components/scorecard/potm-card";
import { InningsSummary } from "@/components/live-scoring/innings-summary";
import type { Fixture } from "@/lib/cricket/fixture-types";
import type { LiveMatchState } from "@/lib/liveScoring/types";

// The Match Details hub's "Scorecard" tab -- the raw batting/bowling tables
// and result, reusing exactly the components the standalone
// /matches/[id]/scorecard page already built (left untouched to avoid any
// risk of visibly reordering that existing page). The chart/comparison half
// of what that page shows lives in the sibling "Statistics" tab instead, so
// the two tabs partition its content rather than duplicating it wholesale.
export function ScorecardTab({ state, fixture }: { state: LiveMatchState; fixture: Fixture }) {
  const innings1HasBalls = state.innings1.legalBalls > 0 || state.innings1.events.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {state.status === "completed" && state.result && (
        <section>
          <MatchResultBanner result={state.result} matchName={fixture.name} tournament={fixture.tournament.name} />
        </section>
      )}

      {state.potm && (
        <section>
          <PotmCard potm={state.potm} />
        </section>
      )}

      {innings1HasBalls && (
        <section>
          <SectionLabel>{state.innings1.battingTeam} Innings</SectionLabel>
          <InningsSummary innings={state.innings1} />
        </section>
      )}

      {state.innings2 && (
        <section>
          <SectionLabel>{state.innings2.battingTeam} Innings</SectionLabel>
          <InningsSummary innings={state.innings2} />
        </section>
      )}

      {!innings1HasBalls && !state.innings2 && (
        <p className="py-10 text-center text-xs text-muted">No deliveries recorded yet.</p>
      )}
    </div>
  );
}
