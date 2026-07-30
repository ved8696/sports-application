"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FieldLabel, FieldError } from "@/components/match-creation/form-field";
import { useMatchSetupStore } from "@/lib/store/match-setup-store";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useSetupFixture } from "@/lib/matchSetup/useSetupFixture";
import { guardRedirect, validateCaptainsStep, toFixtureTeams, toFixturePlayingXI } from "@/lib/matchSetup/validation";
import { SETUP_STEPS, SETUP_STEP_TITLE, setupStepPath } from "@/lib/matchSetup/types";

type TeamKey = "A" | "B";

const SELECT_CLASS =
  "h-[52px] w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40";

export default function CaptainsPage() {
  const router = useRouter();
  const { fixtureId } = useSetupFixture();
  const { draft, setXIA, setXIB } = useMatchSetupStore();
  const { updateFixture } = useFixtureStore();
  const [active, setActive] = useState<TeamKey>("A");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixtureId) return;
    const redirect = guardRedirect(fixtureId, draft, "captains");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId]);

  const team = active === "A" ? draft.teamA : draft.teamB;
  const xi = active === "A" ? draft.xiA : draft.xiB;
  const setXI = active === "A" ? setXIA : setXIB;
  const errors = validateCaptainsStep(draft);

  async function handleNext() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateFixture(fixtureId, { teams: toFixtureTeams(draft), playingXI: toFixturePlayingXI(draft) });
      router.push(setupStepPath(fixtureId, "toss"));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save Playing XI.");
      setSubmitting(false);
    }
  }

  return (
    <WizardShell
      title={SETUP_STEP_TITLE.captains}
      stepIndex={SETUP_STEPS.indexOf("captains")}
      stepCount={SETUP_STEPS.length}
      backHref={setupStepPath(fixtureId, "playing-xi")}
      footer={
        <div className="flex flex-col gap-2.5">
          {submitError && (
            <p className="flex items-center gap-1.5 text-xs text-red">
              <AlertTriangle size={13} /> {submitError}
            </p>
          )}
          <Button onClick={handleNext} disabled={submitting}>
            {submitting ? "Saving…" : "Continue"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 pt-1">
        <SegmentedControl
          options={[
            { value: "A", label: draft.teamA.name || "Team A" },
            { value: "B", label: draft.teamB.name || "Team B" },
          ]}
          value={active}
          onChange={(v) => setActive(v as TeamKey)}
        />

        <p className="text-[12px] text-muted-2">
          Choose from {team.name || "this team"}&apos;s Playing XI ({xi.players.length} players).
        </p>

        <div>
          <FieldLabel htmlFor="captain">Captain</FieldLabel>
          <select
            id="captain"
            value={xi.captain ?? ""}
            onChange={(e) => setXI({ captain: e.target.value || null })}
            className={SELECT_CLASS}
          >
            <option value="">Select captain…</option>
            {xi.players.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel htmlFor="vice-captain">Vice Captain (optional)</FieldLabel>
          <select
            id="vice-captain"
            value={xi.viceCaptain ?? ""}
            onChange={(e) => setXI({ viceCaptain: e.target.value || null })}
            className={SELECT_CLASS}
          >
            <option value="">None</option>
            {xi.players
              .filter((p) => p !== xi.captain)
              .map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
          </select>
        </div>

        <div>
          <FieldLabel htmlFor="wicket-keeper">Wicket Keeper</FieldLabel>
          <select
            id="wicket-keeper"
            value={xi.wicketKeeper ?? ""}
            onChange={(e) => setXI({ wicketKeeper: e.target.value || null })}
            className={SELECT_CLASS}
          >
            <option value="">Select wicket keeper…</option>
            {xi.players.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {touched && <FieldError>{active === "A" ? errors.xiA : errors.xiB}</FieldError>}
      </div>
    </WizardShell>
  );
}
