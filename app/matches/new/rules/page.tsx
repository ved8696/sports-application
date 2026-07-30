"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Card } from "@/components/ui/card";
import { FieldLabel, FieldError } from "@/components/match-creation/form-field";
import { useMatchCreationStore } from "@/lib/store/match-creation-store";
import { guardRedirect, validateRulesStep } from "@/lib/matchCreation/validation";
import { WIZARD_STEPS, STEP_TITLE } from "@/lib/matchCreation/types";
import { RETIREMENT_OPTIONS } from "@/lib/matchCreation/defaults";

const SELECT_CLASS =
  "h-[52px] w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40";

export default function CompetitionRulesStep() {
  const router = useRouter();
  const { draft, updateRules } = useMatchCreationStore();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const isTest = draft.format === "Test";
  const errors = validateRulesStep(draft);

  useEffect(() => {
    const redirect = guardRedirect(draft, "rules");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markTouched(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleNext() {
    setTouched({ oversPerInnings: true, powerplayOvers: true, wideRuns: true, noBallRuns: true });
    if (Object.keys(errors).length > 0) return;
    router.push("/matches/new/venue");
  }

  return (
    <WizardShell
      title={STEP_TITLE.rules}
      stepIndex={WIZARD_STEPS.indexOf("rules")}
      stepCount={WIZARD_STEPS.length}
      backHref="/matches/new/details"
      footer={<Button onClick={handleNext}>Continue</Button>}
    >
      <div className="flex flex-col gap-5 pt-1">
        {!isTest && (
          <div>
            <FieldLabel htmlFor="overs-per-innings">Overs per Innings</FieldLabel>
            <Input
              id="overs-per-innings"
              type="number"
              min={1}
              value={draft.rules.oversPerInnings ?? ""}
              onChange={(e) =>
                updateRules({ oversPerInnings: e.target.value ? Number(e.target.value) : null })
              }
              onBlur={() => markTouched("oversPerInnings")}
              error={touched.oversPerInnings ? errors.oversPerInnings : undefined}
            />
            {touched.oversPerInnings && <FieldError>{errors.oversPerInnings}</FieldError>}
          </div>
        )}

        {!isTest && (
          <div>
            <FieldLabel htmlFor="powerplay-overs">Powerplay Overs</FieldLabel>
            <Input
              id="powerplay-overs"
              type="number"
              min={1}
              value={draft.rules.powerplayOvers ?? ""}
              onChange={(e) => updateRules({ powerplayOvers: e.target.value ? Number(e.target.value) : null })}
              onBlur={() => markTouched("powerplayOvers")}
              error={touched.powerplayOvers ? errors.powerplayOvers : undefined}
            />
            {touched.powerplayOvers && <FieldError>{errors.powerplayOvers}</FieldError>}
          </div>
        )}

        <div>
          <FieldLabel htmlFor="wide-runs">Wide Ball — Runs Awarded</FieldLabel>
          <Input
            id="wide-runs"
            type="number"
            min={0}
            value={draft.rules.wideRuns}
            onChange={(e) => updateRules({ wideRuns: Number(e.target.value) })}
            onBlur={() => markTouched("wideRuns")}
            error={touched.wideRuns ? errors.wideRuns : undefined}
          />
          {touched.wideRuns && <FieldError>{errors.wideRuns}</FieldError>}
        </div>

        <div>
          <FieldLabel htmlFor="no-ball-runs">No Ball — Runs Awarded</FieldLabel>
          <Input
            id="no-ball-runs"
            type="number"
            min={0}
            value={draft.rules.noBallRuns}
            onChange={(e) => updateRules({ noBallRuns: Number(e.target.value) })}
            onBlur={() => markTouched("noBallRuns")}
            error={touched.noBallRuns ? errors.noBallRuns : undefined}
          />
          {touched.noBallRuns && <FieldError>{errors.noBallRuns}</FieldError>}
        </div>

        {!isTest && (
          <Card className="px-4">
            <ToggleSwitch
              label="Free Hit"
              description="Next ball after a no-ball can't dismiss the batter (except run out)."
              checked={draft.rules.freeHit}
              onChange={(v) => updateRules({ freeHit: v })}
            />
            <div className="border-t border-white/[0.06]" />
            <ToggleSwitch
              label="Super Over"
              description="Tied match goes to a one-over eliminator."
              checked={draft.rules.superOver}
              onChange={(v) => updateRules({ superOver: v })}
            />
            <div className="border-t border-white/[0.06]" />
            <ToggleSwitch
              label="Duckworth-Lewis (DLS)"
              description="Adjust the target if the match is interrupted."
              checked={draft.rules.dls}
              onChange={(v) => updateRules({ dls: v })}
            />
          </Card>
        )}

        <div>
          <FieldLabel htmlFor="retirement">Retirement Rule</FieldLabel>
          <select
            id="retirement"
            value={draft.rules.retirement}
            onChange={(e) => updateRules({ retirement: e.target.value as typeof draft.rules.retirement })}
            className={SELECT_CLASS}
          >
            {RETIREMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </WizardShell>
  );
}
