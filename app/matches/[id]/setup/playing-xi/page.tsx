"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { OptionCard } from "@/components/match-creation/option-card";
import { FieldError } from "@/components/match-creation/form-field";
import { useMatchSetupStore } from "@/lib/store/match-setup-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { useSetupFixture } from "@/lib/matchSetup/useSetupFixture";
import { guardRedirect, validatePlayingXIStep, PLAYING_XI_SIZE } from "@/lib/matchSetup/validation";
import { SETUP_STEPS, SETUP_STEP_TITLE, setupStepPath } from "@/lib/matchSetup/types";

type TeamKey = "A" | "B";

export default function PlayingXIPage() {
  const router = useRouter();
  const { fixtureId, fixtureStatus } = useSetupFixture();
  const { draft, setXIA, setXIB } = useMatchSetupStore();
  const hasHydrated = useHasHydrated(useMatchSetupStore.persist);
  const [active, setActive] = useState<TeamKey>("A");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!fixtureId || !hasHydrated || fixtureStatus !== "ready") return;
    const redirect = guardRedirect(fixtureId, draft, "playing-xi");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId, hasHydrated, fixtureStatus]);

  const team = active === "A" ? draft.teamA : draft.teamB;
  const xi = active === "A" ? draft.xiA : draft.xiB;
  const setXI = active === "A" ? setXIA : setXIB;
  const errors = validatePlayingXIStep(draft);

  function toggle(name: string) {
    if (xi.players.includes(name)) {
      setXI({ players: xi.players.filter((p) => p !== name) });
    } else if (xi.players.length < PLAYING_XI_SIZE) {
      setXI({ players: [...xi.players, name] });
    }
  }

  const bench = [...team.squad].filter((p) => !xi.players.includes(p)).sort((a, b) => a.localeCompare(b));
  const atMax = xi.players.length >= PLAYING_XI_SIZE;

  function handleNext() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    router.push(setupStepPath(fixtureId, "captains"));
  }

  return (
    <WizardShell
      title={SETUP_STEP_TITLE["playing-xi"]}
      stepIndex={SETUP_STEPS.indexOf("playing-xi")}
      stepCount={SETUP_STEPS.length}
      backHref={setupStepPath(fixtureId, "squad")}
      footer={<Button onClick={handleNext}>Continue</Button>}
    >
      <div className="flex flex-col gap-4 pt-1">
        <SegmentedControl
          options={[
            { value: "A", label: draft.teamA.name || "Team A" },
            { value: "B", label: draft.teamB.name || "Team B" },
          ]}
          value={active}
          onChange={(v) => setActive(v as TeamKey)}
        />

        <div
          className={
            "rounded-xl border px-4 py-3 text-[12.5px] " +
            (xi.players.length === PLAYING_XI_SIZE ? "border-blue/50 bg-blue/[0.06] text-foreground" : "border-border bg-surface text-muted")
          }
        >
          Playing XI · <span className="font-semibold">{xi.players.length}</span> / {PLAYING_XI_SIZE} selected
          {atMax && xi.players.length === PLAYING_XI_SIZE && " · Full"}
        </div>

        {xi.players.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">Playing XI</p>
            <div className="flex flex-col gap-2">
              {xi.players.map((name) => (
                <OptionCard key={name} title={name} selected onClick={() => toggle(name)} />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">
            Bench{atMax ? " · XI is full" : ""}
          </p>
          {bench.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted">No players left on the bench.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {bench.map((name) => (
                <button
                  key={name}
                  type="button"
                  disabled={atMax}
                  onClick={() => toggle(name)}
                  className="w-full text-left disabled:opacity-40"
                >
                  <div className="rounded-[var(--radius-card)] border border-border bg-surface-2 p-3.5">
                    <p className="text-[13.5px] font-bold">{name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {touched && <FieldError>{active === "A" ? errors.xiA : errors.xiB}</FieldError>}
      </div>
    </WizardShell>
  );
}
