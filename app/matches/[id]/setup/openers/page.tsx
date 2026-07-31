"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleDot, Loader2, Users } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerPickerSheet } from "@/components/live-scoring/player-picker-sheet";
import { FieldError } from "@/components/match-creation/form-field";
import { useMatchSetupStore } from "@/lib/store/match-setup-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { useSetupFixture } from "@/lib/matchSetup/useSetupFixture";
import { guardRedirect, validateOpenersStep } from "@/lib/matchSetup/validation";
import { SETUP_STEPS, SETUP_STEP_TITLE, setupStepPath } from "@/lib/matchSetup/types";
import { battingFirstTeam, bowlingFirstTeam } from "@/lib/liveScoring/initialize";
import type { LucideIcon } from "lucide-react";

type Slot = "striker" | "nonStriker" | "bowler" | null;

// Opening striker/non-striker/bowler are chosen here, ahead of the live
// scoreboard, so "Start Match" on the Match Ready screen can launch straight
// into an in-progress innings instead of stopping at a setup screen once the
// match is live.
export default function OpeningPlayersPage() {
  const router = useRouter();
  const { fixtureId, fixture, fixtureStatus } = useSetupFixture();
  const { draft, setOpeners } = useMatchSetupStore();
  const hasHydrated = useHasHydrated(useMatchSetupStore.persist);
  const [sheet, setSheet] = useState<Slot>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!fixtureId || !hasHydrated || fixtureStatus !== "ready") return;
    const redirect = guardRedirect(fixtureId, draft, "openers");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId, hasHydrated, fixtureStatus]);

  const errors = validateOpenersStep(draft);

  if (fixtureStatus !== "ready" || !fixture || !fixture.teams || !fixture.playingXI || !fixture.toss) {
    return (
      <WizardShell
        title={SETUP_STEP_TITLE.openers}
        stepIndex={SETUP_STEPS.indexOf("openers")}
        stepCount={SETUP_STEPS.length}
        backHref={setupStepPath(fixtureId, "toss")}
        footer={<Button disabled>Continue</Button>}
      >
        <Card className="flex items-center justify-center gap-2.5 py-14 text-sm text-muted">
          <Loader2 size={16} className="animate-spin text-blue" />
          Loading match…
        </Card>
      </WizardShell>
    );
  }

  const battingTeam = battingFirstTeam(fixture);
  const bowlingTeam = bowlingFirstTeam(fixture);
  const battingXI = fixture.playingXI.find((x) => x.team === battingTeam)?.players ?? [];
  const bowlingXI = fixture.playingXI.find((x) => x.team === bowlingTeam)?.players ?? [];

  function handleNext() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    router.push(setupStepPath(fixtureId, "ready"));
  }

  return (
    <WizardShell
      title={SETUP_STEP_TITLE.openers}
      stepIndex={SETUP_STEPS.indexOf("openers")}
      stepCount={SETUP_STEPS.length}
      backHref={setupStepPath(fixtureId, "toss")}
      footer={<Button onClick={handleNext}>Continue</Button>}
    >
      <div className="flex flex-col gap-4 pt-1">
        <Card className="p-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-wood">First Innings</p>
          <p className="mt-1 text-[15px] font-bold">
            {battingTeam} <span className="font-normal text-muted-2">batting</span>
          </p>
          <p className="text-[12px] text-muted-2">{bowlingTeam} bowling</p>
        </Card>

        <PickerRow
          label="Opening Batter 1 (Strike)"
          value={draft.openers.striker}
          icon={Users}
          onPress={() => setSheet("striker")}
        />
        {touched && <FieldError>{errors.striker}</FieldError>}

        <PickerRow
          label="Opening Batter 2"
          value={draft.openers.nonStriker}
          icon={Users}
          onPress={() => setSheet("nonStriker")}
        />
        {touched && <FieldError>{errors.nonStriker}</FieldError>}

        <PickerRow label="Opening Bowler" value={draft.openers.bowler} icon={CircleDot} onPress={() => setSheet("bowler")} />
        {touched && <FieldError>{errors.bowler}</FieldError>}
      </div>

      <PlayerPickerSheet
        open={sheet === "striker"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Opening Batter 1 (Strike)"
        players={battingXI}
        disabledNames={draft.openers.nonStriker ? [draft.openers.nonStriker] : []}
        onSelect={(name) => {
          setOpeners({ striker: name });
          setSheet(null);
        }}
      />
      <PlayerPickerSheet
        open={sheet === "nonStriker"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Opening Batter 2"
        players={battingXI}
        disabledNames={draft.openers.striker ? [draft.openers.striker] : []}
        onSelect={(name) => {
          setOpeners({ nonStriker: name });
          setSheet(null);
        }}
      />
      <PlayerPickerSheet
        open={sheet === "bowler"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Opening Bowler"
        players={bowlingXI}
        onSelect={(name) => {
          setOpeners({ bowler: name });
          setSheet(null);
        }}
      />
    </WizardShell>
  );
}

function PickerRow({ label, value, icon: Icon, onPress }: { label: string; value: string | null; icon: LucideIcon; onPress: () => void }) {
  return (
    <button type="button" onClick={onPress} className="w-full text-left transition-transform active:scale-[0.98]">
      <Card className="flex items-center gap-3 p-3.5">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-wood/15 text-wood">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] text-muted-2">{label}</p>
          <p className="truncate text-[14px] font-semibold">{value ?? "Tap to select"}</p>
        </div>
      </Card>
    </button>
  );
}
