"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTournamentCreationStore } from "@/lib/store/tournament-creation-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { useTournamentStore } from "@/lib/store/tournament-store";
import { guardRedirect } from "@/lib/tournament/validation";
import { WIZARD_STEPS, STEP_TITLE, TOURNAMENT_FORMAT_LABEL } from "@/lib/tournament/types";

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TournamentReviewStep() {
  const router = useRouter();
  const { draft, reset } = useTournamentCreationStore();
  const hasHydrated = useHasHydrated(useTournamentCreationStore.persist);
  const { createTournament } = useTournamentStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    const redirect = guardRedirect(draft, "review");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  async function handleCreate() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const tournament = await createTournament(draft);
      reset();
      router.push(`/tournaments/${tournament.id}/created`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create tournament.");
      setSubmitting(false);
    }
  }

  if (!hasHydrated) return null;

  return (
    <WizardShell
      title={STEP_TITLE.review}
      stepIndex={WIZARD_STEPS.indexOf("review")}
      stepCount={WIZARD_STEPS.length}
      backHref="/tournaments/new/teams"
      footer={
        <div className="flex flex-col gap-2.5">
          {submitError && (
            <p className="flex items-center gap-1.5 text-xs text-red">
              <AlertTriangle size={13} /> {submitError}
            </p>
          )}
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? "Creating Tournament…" : "Create Tournament"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pt-1">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold">Info</p>
            <Button variant="link" size="sm" onClick={() => router.push("/tournaments/new")} className="h-auto p-0 text-[10px]">
              Edit
            </Button>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {draft.name || "Untitled Tournament"} · {formatDate(draft.startDate)}–{formatDate(draft.endDate)}
          </p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold">Format</p>
            <Button variant="link" size="sm" onClick={() => router.push("/tournaments/new/format")} className="h-auto p-0 text-[10px]">
              Edit
            </Button>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {TOURNAMENT_FORMAT_LABEL[draft.format]} · {draft.numberOfTeams} Teams
          </p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold">Rules</p>
            <Button variant="link" size="sm" onClick={() => router.push("/tournaments/new/rules")} className="h-auto p-0 text-[10px]">
              Edit
            </Button>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {draft.rules.oversPerInnings} overs · DRS {draft.rules.drs ? "on" : "off"} · Super Over {draft.rules.superOver ? "on" : "off"}
          </p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold">Teams ({draft.teams.length})</p>
            <Button variant="link" size="sm" onClick={() => router.push("/tournaments/new/teams")} className="h-auto p-0 text-[10px]">
              Edit
            </Button>
          </div>
          <div className="mt-2 flex">
            {draft.teams.slice(0, 3).map((t, i) => (
              <div key={t.name} className="-ml-1.5 h-[22px] w-[22px] rounded-full border-[1.5px] border-surface bg-surface-3 first:ml-0" style={{ zIndex: 3 - i }} />
            ))}
            {draft.teams.length > 3 && (
              <div className="-ml-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">
                +{draft.teams.length - 3}
              </div>
            )}
          </div>
        </Card>
      </div>
    </WizardShell>
  );
}
