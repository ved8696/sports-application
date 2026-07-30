"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldError } from "@/components/match-creation/form-field";
import { useTournamentCreationStore } from "@/lib/store/tournament-creation-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { validateInfoStep } from "@/lib/tournament/validation";
import { WIZARD_STEPS, STEP_TITLE } from "@/lib/tournament/types";

export default function TournamentInfoStep() {
  const router = useRouter();
  const { draft, updateDraft } = useTournamentCreationStore();
  const hasHydrated = useHasHydrated(useTournamentCreationStore.persist);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = validateInfoStep(draft);

  function markTouched(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleNext() {
    setTouched({ name: true, startDate: true, endDate: true });
    if (Object.keys(errors).length > 0) return;
    router.push("/tournaments/new/format");
  }

  if (!hasHydrated) return null;

  return (
    <WizardShell
      title={STEP_TITLE.info}
      stepIndex={WIZARD_STEPS.indexOf("info")}
      stepCount={WIZARD_STEPS.length}
      backHref="/tournaments"
      footer={<Button onClick={handleNext}>Continue</Button>}
    >
      <div className="flex flex-col gap-1 pb-3 pt-1">
        <p className="text-[11px] text-muted">Basic details about your tournament</p>
      </div>
      <div className="flex flex-col gap-3.5">
        <div>
          <FieldLabel htmlFor="tournament-name">Tournament Name</FieldLabel>
          <Input
            id="tournament-name"
            value={draft.name}
            onChange={(e) => updateDraft({ name: e.target.value })}
            onBlur={() => markTouched("name")}
            placeholder="Premier League 2026"
            error={touched.name ? errors.name : undefined}
          />
          {touched.name && <FieldError>{errors.name}</FieldError>}
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1">
            <FieldLabel htmlFor="start-date">Start Date</FieldLabel>
            <Input
              id="start-date"
              type="date"
              value={draft.startDate}
              onChange={(e) => updateDraft({ startDate: e.target.value })}
              onBlur={() => markTouched("startDate")}
              error={touched.startDate ? errors.startDate : undefined}
            />
            {touched.startDate && <FieldError>{errors.startDate}</FieldError>}
          </div>
          <div className="flex-1">
            <FieldLabel htmlFor="end-date">End Date</FieldLabel>
            <Input
              id="end-date"
              type="date"
              value={draft.endDate}
              onChange={(e) => updateDraft({ endDate: e.target.value })}
              onBlur={() => markTouched("endDate")}
              error={touched.endDate ? errors.endDate : undefined}
            />
            {touched.endDate && <FieldError>{errors.endDate}</FieldError>}
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <textarea
            id="description"
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
            placeholder="Optional — add context for participants…"
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-2 focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40"
          />
        </div>
      </div>
    </WizardShell>
  );
}
