"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/match-creation/form-field";
import { useTournamentCreationStore } from "@/lib/store/tournament-creation-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { guardRedirect, validateFormatStep } from "@/lib/tournament/validation";
import { WIZARD_STEPS, STEP_TITLE, TOURNAMENT_FORMAT_LABEL, TOURNAMENT_FORMAT_DESCRIPTION, type TournamentFormat } from "@/lib/tournament/types";

const FORMATS: TournamentFormat[] = ["league+playoffs", "knockout", "league"];

export default function TournamentFormatStep() {
  const router = useRouter();
  const { draft, updateDraft, adjustTeamCount } = useTournamentCreationStore();
  const hasHydrated = useHasHydrated(useTournamentCreationStore.persist);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    const redirect = guardRedirect(draft, "format");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  const errors = validateFormatStep(draft);

  function handleNext() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    router.push("/tournaments/new/rules");
  }

  if (!hasHydrated) return null;

  return (
    <WizardShell
      title={STEP_TITLE.format}
      stepIndex={WIZARD_STEPS.indexOf("format")}
      stepCount={WIZARD_STEPS.length}
      backHref="/tournaments/new"
      footer={
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => router.push("/tournaments/new")} className="flex-1">
            Back
          </Button>
          <Button onClick={handleNext} className="flex-1">
            Continue
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2.5 pt-1">
        {FORMATS.map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => updateDraft({ format })}
            className={`rounded-xl border p-3 text-left ${draft.format === format ? "border-2 border-foreground" : "border-border"}`}
          >
            <p className="text-[13px] font-bold">{TOURNAMENT_FORMAT_LABEL[format]}</p>
            <p className="mt-0.5 text-[11px] text-muted-2">{TOURNAMENT_FORMAT_DESCRIPTION[format]}</p>
          </button>
        ))}

        <div className="pt-3">
          <p className="mb-1.5 text-xs font-semibold text-muted">Number of Teams</p>
          <div className="flex h-11 items-center justify-between rounded-xl border border-border px-3">
            <button
              type="button"
              aria-label="Decrease team count"
              onClick={() => adjustTeamCount(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted"
            >
              <Minus size={14} />
            </button>
            <span className="text-[15px] font-bold">{draft.numberOfTeams}</span>
            <button
              type="button"
              aria-label="Increase team count"
              onClick={() => adjustTeamCount(1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted"
            >
              <Plus size={14} />
            </button>
          </div>
          {touched && <FieldError>{errors.numberOfTeams}</FieldError>}
        </div>
      </div>
    </WizardShell>
  );
}
