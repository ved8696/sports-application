"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useTournamentCreationStore } from "@/lib/store/tournament-creation-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { guardRedirect } from "@/lib/tournament/validation";
import { WIZARD_STEPS, STEP_TITLE } from "@/lib/tournament/types";

export default function TournamentRulesStep() {
  const router = useRouter();
  const { draft, updateRules } = useTournamentCreationStore();
  const hasHydrated = useHasHydrated(useTournamentCreationStore.persist);

  useEffect(() => {
    if (!hasHydrated) return;
    const redirect = guardRedirect(draft, "rules");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  if (!hasHydrated) return null;
  const { rules } = draft;

  return (
    <WizardShell
      title={STEP_TITLE.rules}
      stepIndex={WIZARD_STEPS.indexOf("rules")}
      stepCount={WIZARD_STEPS.length}
      backHref="/tournaments/new/format"
      footer={
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => router.push("/tournaments/new/format")} className="flex-1">
            Back
          </Button>
          <Button onClick={() => router.push("/tournaments/new/teams")} className="flex-1">
            Continue
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3.5 pt-1">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium">Overs per innings</p>
          <Input
            type="number"
            min={1}
            value={rules.oversPerInnings}
            onChange={(e) => updateRules({ oversPerInnings: Number(e.target.value) || 0 })}
            className="h-9 w-20 text-center"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium">Powerplay overs</p>
          <Input
            type="number"
            min={0}
            value={rules.powerplayOvers ?? 0}
            onChange={(e) => updateRules({ powerplayOvers: Number(e.target.value) || 0 })}
            className="h-9 w-20 text-center"
          />
        </div>
        <div className="h-px bg-border" />
        <ToggleSwitch label="DRS enabled" checked={rules.drs} onChange={(v) => updateRules({ drs: v })} />
        <ToggleSwitch label="Super Over on tie" checked={rules.superOver} onChange={(v) => updateRules({ superOver: v })} />
        <ToggleSwitch label="Duckworth-Lewis" checked={rules.dls} onChange={(v) => updateRules({ dls: v })} />
      </div>
    </WizardShell>
  );
}
