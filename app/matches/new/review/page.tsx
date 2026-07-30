"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewSection, SummaryRow } from "@/components/match-creation/review-section";
import { useMatchCreationStore } from "@/lib/store/match-creation-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { guardRedirect, toFixtureDraft } from "@/lib/matchCreation/validation";
import { WIZARD_STEPS, STEP_TITLE } from "@/lib/matchCreation/types";
import { GENDER_OPTIONS, venueLabel } from "@/lib/matchCreation/defaults";

const TOURNAMENT_TYPE_LABEL: Record<string, string> = {
  friendly: "Friendly Match",
  league: "League Match",
  tournament: "Tournament Match",
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(hhmm: string): string {
  if (!hhmm) return "—";
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function ReviewMatchStep() {
  const router = useRouter();
  const { draft, reset } = useMatchCreationStore();
  const hasHydrated = useHasHydrated(useMatchCreationStore.persist);
  const { createFixture } = useFixtureStore();
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
      const fixture = await createFixture(toFixtureDraft(draft));
      reset();
      router.push(`/matches/${fixture.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create match.");
      setSubmitting(false);
    }
  }

  const { rules } = draft;

  return (
    <WizardShell
      title={STEP_TITLE.review}
      stepIndex={WIZARD_STEPS.indexOf("review")}
      stepCount={WIZARD_STEPS.length}
      backHref="/matches/new/schedule"
      footer={
        <div className="flex flex-col gap-2.5">
          {submitError && (
            <p className="flex items-center gap-1.5 text-xs text-red">
              <AlertTriangle size={13} /> {submitError}
            </p>
          )}
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? "Creating Match…" : "Create Match"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pt-1">
        <Card className="px-4 py-3.5">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">{draft.name ? "Match" : ""}</p>
          <p className="mt-0.5 text-[16px] font-extrabold">{draft.name || "Untitled Match"}</p>
        </Card>

        <ReviewSection title="Tournament" editHref="/matches/new">
          <SummaryRow label="Type" value={TOURNAMENT_TYPE_LABEL[draft.tournament.type ?? ""] ?? "—"} />
          <SummaryRow label="Name" value={draft.tournament.name || "—"} />
        </ReviewSection>

        <ReviewSection title="Format" editHref="/matches/new/details">
          <SummaryRow label="Format" value={draft.format ?? "—"} />
          <SummaryRow label="Overs" value={draft.overs ? `${draft.overs} overs` : "Unlimited"} />
          <SummaryRow label="Ball Type" value={draft.ballType ?? "—"} />
          <SummaryRow
            label="Gender"
            value={GENDER_OPTIONS.find((g) => g.value === draft.gender)?.label ?? "—"}
          />
          <SummaryRow label="Age Group" value={draft.ageGroup} />
          <SummaryRow label="Match Type" value={draft.matchType} />
        </ReviewSection>

        <ReviewSection title="Teams" editHref="/matches/new/details">
          <SummaryRow label="Playing XI" value="Not selected yet" />
        </ReviewSection>

        <ReviewSection title="Rules" editHref="/matches/new/rules">
          <SummaryRow label="Overs per Innings" value={rules.oversPerInnings ? `${rules.oversPerInnings}` : "Unlimited"} />
          {rules.powerplayOvers !== null && <SummaryRow label="Powerplay" value={`${rules.powerplayOvers} overs`} />}
          <SummaryRow label="Wide Ball" value={`${rules.wideRuns} run${rules.wideRuns === 1 ? "" : "s"}`} />
          <SummaryRow label="No Ball" value={`${rules.noBallRuns} run${rules.noBallRuns === 1 ? "" : "s"}`} />
          <SummaryRow label="Free Hit" value={rules.freeHit ? "Enabled" : "Disabled"} />
          <SummaryRow label="Super Over" value={rules.superOver ? "Enabled" : "Disabled"} />
          <SummaryRow label="DLS" value={rules.dls ? "Enabled" : "Disabled"} />
          <SummaryRow
            label="Retirement"
            value={rules.retirement === "none" ? "Not permitted" : rules.retirement === "retired-out" ? "Retired out" : "Retired not out"}
          />
        </ReviewSection>

        <ReviewSection title="Venue" editHref="/matches/new/venue">
          <SummaryRow label="Venue" value={draft.venue.name ? venueLabel(draft.venue) : "—"} />
        </ReviewSection>

        <ReviewSection title="Date & Time" editHref="/matches/new/schedule">
          <SummaryRow label="Date" value={formatDate(draft.date)} />
          <SummaryRow label="Start Time" value={formatTime(draft.startTime)} />
          <SummaryRow label="Time Zone" value={draft.timeZone || "—"} />
          <SummaryRow label="Day / Night" value={draft.dayNight ?? "—"} />
        </ReviewSection>
      </div>
    </WizardShell>
  );
}
