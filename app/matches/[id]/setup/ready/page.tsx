"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Crown, Shield } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewSection, SummaryRow } from "@/components/match-creation/review-section";
import { useMatchSetupStore } from "@/lib/store/match-setup-store";
import { useSetupFixture } from "@/lib/matchSetup/useSetupFixture";
import { guardRedirect } from "@/lib/matchSetup/validation";
import { SETUP_STEPS, SETUP_STEP_TITLE, setupStepPath } from "@/lib/matchSetup/types";
import { venueLabel } from "@/lib/matchCreation/defaults";

export default function MatchReadyPage() {
  const router = useRouter();
  const { fixtureId, fixture, fixtureStatus } = useSetupFixture();
  const { draft } = useMatchSetupStore();

  useEffect(() => {
    if (!fixtureId) return;
    const redirect = guardRedirect(fixtureId, draft, "ready");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId]);

  if (fixtureStatus !== "ready" || !fixture) {
    return (
      <WizardShell
        title={SETUP_STEP_TITLE.ready}
        stepIndex={SETUP_STEPS.indexOf("ready")}
        stepCount={SETUP_STEPS.length}
        backHref={setupStepPath(fixtureId, "toss")}
        footer={<Button disabled>Start Match</Button>}
      >
        <Card className="flex items-center justify-center gap-2.5 py-14 text-sm text-muted">
          <Loader2 size={16} className="animate-spin text-blue" />
          Loading match…
        </Card>
      </WizardShell>
    );
  }

  const [teamA, teamB] = fixture.teams ?? [];
  const [xiA, xiB] = fixture.playingXI ?? [];
  const toss = fixture.toss;
  const battingFirst = toss ? (toss.decision === "bat" ? toss.winner : (toss.winner === teamA?.name ? teamB?.name : teamA?.name)) : undefined;

  return (
    <WizardShell
      title={SETUP_STEP_TITLE.ready}
      stepIndex={SETUP_STEPS.indexOf("ready")}
      stepCount={SETUP_STEPS.length}
      backHref={setupStepPath(fixtureId, "toss")}
      footer={
        <Button asChild>
          <Link href={`/matches/${fixtureId}/live`}>Start Match</Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-4 pt-1">
        <Card className="p-5">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-wood">Ready to Play</p>
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

        <ReviewSection title="Match" editHref={setupStepPath(fixtureId, "toss")}>
          <SummaryRow label="Venue" value={venueLabel(fixture.venue)} />
          <SummaryRow label="Tournament" value={fixture.tournament.name} />
          <SummaryRow label="Toss Winner" value={toss?.winner ?? "—"} />
          <SummaryRow label="Batting First" value={battingFirst ?? "—"} />
        </ReviewSection>

        {[
          { team: teamA, xi: xiA },
          { team: teamB, xi: xiB },
        ].map(({ team, xi }) =>
          team && xi ? (
            <Card key={team.name} className="px-4">
              <div className="flex items-center justify-between pt-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-wood">
                  {team.name} {toss?.winner === team.name && <span className="text-blue">· Won Toss</span>}
                </p>
                <p className="text-[11px] text-muted-2">{xi.players.length} players</p>
              </div>
              <div className="divide-y divide-white/[0.06] pb-1">
                {xi.players.map((player) => (
                  <div key={player} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="truncate text-[13px] font-semibold">{player}</span>
                    <div className="flex flex-none items-center gap-1.5">
                      {player === xi.captain && (
                        <span className="flex items-center gap-1 rounded-full bg-wood/15 px-2 py-0.5 text-[10px] font-bold text-wood">
                          <Crown size={10} /> C
                        </span>
                      )}
                      {player === xi.viceCaptain && (
                        <span className="rounded-full bg-walnut/20 px-2 py-0.5 text-[10px] font-bold text-wood">VC</span>
                      )}
                      {player === xi.wicketKeeper && (
                        <span className="flex items-center gap-1 rounded-full bg-blue/15 px-2 py-0.5 text-[10px] font-bold text-blue">
                          <Shield size={10} /> WK
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null
        )}
      </div>
    </WizardShell>
  );
}
