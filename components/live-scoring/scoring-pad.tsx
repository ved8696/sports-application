"use client";

import { Undo2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RUN_VALUES = [0, 1, 2, 3, 4, 5, 6];

// Large one-handed-reachable buttons, minimal taps per ball -- a plain run is
// a single tap, everything else (extras/wicket) is one tap to open a sheet.
export function ScoringPad({
  onRun,
  onExtras,
  onWicket,
  onUndo,
  onPenalty,
  canUndo,
  disabled,
  isFreeHit,
}: {
  onRun: (runs: number) => void;
  onExtras: () => void;
  onWicket: () => void;
  onUndo: () => void;
  onPenalty: () => void;
  canUndo: boolean;
  disabled: boolean;
  isFreeHit: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {isFreeHit && (
        <div className="rounded-lg bg-blue/15 px-3 py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-blue">
          Free Hit
        </div>
      )}

      <div className="grid grid-cols-4 gap-2.5">
        {RUN_VALUES.map((r) => (
          <button
            key={r}
            type="button"
            disabled={disabled}
            onClick={() => onRun(r)}
            className={cn(
              "flex h-14 items-center justify-center rounded-2xl border text-xl font-extrabold transition-transform active:scale-95 disabled:opacity-40",
              r === 4 || r === 6 ? "border-wood/50 bg-wood/15 text-wood" : "border-border bg-surface-2 text-foreground"
            )}
          >
            {r}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={onPenalty}
          className="flex h-14 flex-col items-center justify-center rounded-2xl border border-border bg-surface-2 text-[10px] font-bold text-muted transition-transform active:scale-95 disabled:opacity-40"
        >
          <Plus size={13} />
          PEN
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Button variant="outline" size="md" disabled={disabled} onClick={onExtras}>
          Extras
        </Button>
        <Button variant="danger" size="md" disabled={disabled} onClick={onWicket}>
          Wicket
        </Button>
        <Button variant="outline" size="md" disabled={!canUndo} onClick={onUndo} className="gap-1.5">
          <Undo2 size={15} />
          Undo
        </Button>
      </div>
    </div>
  );
}
