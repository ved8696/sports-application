"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";
import type { ExtraType } from "@/lib/liveScoring/types";
import { EXTRA_LABELS } from "@/lib/liveScoring/extras";

const EXTRA_OPTIONS: ExtraType[] = ["wide", "no-ball", "bye", "leg-bye"];
const RUN_OPTIONS = [0, 1, 2, 3, 4, 6];

export function ExtrasSheet({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (extra: ExtraType, runs: number) => void;
}) {
  const [type, setType] = useState<ExtraType>("wide");
  const [runs, setRuns] = useState(0);

  function confirm() {
    onConfirm(type, runs);
    setType("wide");
    setRuns(0);
  }

  const runsLabel = type === "no-ball" ? "Runs off the bat" : type === "wide" ? "Additional runs run" : "Runs";

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Extras">
      <div className="flex flex-col gap-5 pb-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Type</p>
          <SegmentedControl
            options={EXTRA_OPTIONS.map((e) => ({ value: e, label: EXTRA_LABELS[e] }))}
            value={type}
            onChange={(v) => {
              setType(v);
              setRuns(0);
            }}
          />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">{runsLabel}</p>
          <div className="grid grid-cols-3 gap-2">
            {RUN_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRuns(r)}
                className={cn(
                  "h-12 rounded-xl border text-[16px] font-bold transition-transform active:scale-95",
                  runs === r ? "border-blue/50 bg-blue/15 text-blue" : "border-border bg-surface text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={confirm}>Confirm {EXTRA_LABELS[type]}</Button>
      </div>
    </BottomSheet>
  );
}
