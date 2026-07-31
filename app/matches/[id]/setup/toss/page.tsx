"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Coins, AlertTriangle } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FieldError } from "@/components/match-creation/form-field";
import { useMatchSetupStore } from "@/lib/store/match-setup-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useSetupFixture } from "@/lib/matchSetup/useSetupFixture";
import { guardRedirect, validateTossStep, toFixtureToss } from "@/lib/matchSetup/validation";
import { SETUP_STEPS, SETUP_STEP_TITLE, setupStepPath } from "@/lib/matchSetup/types";

export default function TossPage() {
  const router = useRouter();
  const { fixtureId, fixtureStatus } = useSetupFixture();
  const { draft, setToss } = useMatchSetupStore();
  const hasHydrated = useHasHydrated(useMatchSetupStore.persist);
  const { updateFixture } = useFixtureStore();
  const [flipping, setFlipping] = useState(false);
  const [spins, setSpins] = useState(0);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixtureId || !hasHydrated || fixtureStatus !== "ready") return;
    const redirect = guardRedirect(fixtureId, draft, "toss");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId, hasHydrated, fixtureStatus]);

  const errors = validateTossStep(draft);

  function flipCoin() {
    if (flipping) return;
    setFlipping(true);
    setSpins((s) => s + 1);
    const winner = Math.random() < 0.5 ? draft.teamA.name : draft.teamB.name;
    window.setTimeout(() => {
      setToss(winner, draft.tossDecision);
      setFlipping(false);
    }, 850);
  }

  async function handleNext() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateFixture(fixtureId, { toss: toFixtureToss(draft) });
      router.push(setupStepPath(fixtureId, "ready"));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save the toss.");
      setSubmitting(false);
    }
  }

  return (
    <WizardShell
      title={SETUP_STEP_TITLE.toss}
      stepIndex={SETUP_STEPS.indexOf("toss")}
      stepCount={SETUP_STEPS.length}
      backHref={setupStepPath(fixtureId, "squad")}
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
      <div className="flex flex-col items-center gap-6 pt-6">
        <motion.button
          type="button"
          onClick={flipCoin}
          disabled={flipping}
          key={spins}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: flipping ? 1080 : 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-wood bg-gradient-to-br from-wood to-walnut text-background shadow-[0_0_32px_rgba(200,155,109,0.3)] disabled:opacity-80"
        >
          <Coins size={40} />
        </motion.button>

        <p className="text-center text-[13px] text-muted">
          {flipping ? "Flipping…" : "Tap the coin to flip, or set the winner manually below"}
        </p>

        <div className="w-full">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Toss Winner</p>
          <SegmentedControl
            options={[
              { value: draft.teamA.name, label: draft.teamA.name || "Team A" },
              { value: draft.teamB.name, label: draft.teamB.name || "Team B" },
            ]}
            value={draft.tossWinner}
            onChange={(v) => setToss(v, draft.tossDecision)}
          />
        </div>

        <div className="w-full">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">
            {draft.tossWinner ? `${draft.tossWinner} chooses to` : "Decision"}
          </p>
          <SegmentedControl
            options={[
              { value: "bat", label: "Bat" },
              { value: "bowl", label: "Bowl" },
            ]}
            value={draft.tossDecision}
            onChange={(v) => setToss(draft.tossWinner, v as "bat" | "bowl")}
          />
        </div>

        {touched && <FieldError>{errors.tossWinner ?? errors.tossDecision}</FieldError>}
      </div>
    </WizardShell>
  );
}
