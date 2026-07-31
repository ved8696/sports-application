"use client";

import { useState } from "react";
import { MoreHorizontal, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";

const RUN_VALUES = [0, 1, 2, 3, 4, 5, 6];

// Large one-handed-reachable buttons, minimal taps per ball -- a plain run is
// a single tap, everything else (extras/wicket) is one tap to open a sheet.
// WICKET sits in the main run grid (matches the imported wireframe's 4x2
// scoring pad) rather than its own row; Undo is confirmed first since it
// discards the last recorded ball, and Penalty moves behind "More" to make
// room for Wicket in the grid.
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
  const [undoOpen, setUndoOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  function confirmUndo() {
    setUndoOpen(false);
    onUndo();
  }

  function handlePenalty() {
    setMoreOpen(false);
    onPenalty();
  }

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
          onClick={onWicket}
          className="flex h-14 items-center justify-center rounded-2xl border border-red bg-red text-[13px] font-extrabold uppercase tracking-wide text-white transition-transform active:scale-95 disabled:opacity-40"
        >
          Wicket
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Button variant="outline" size="md" disabled={disabled} onClick={onExtras}>
          Extras
        </Button>
        <Button variant="outline" size="md" disabled={!canUndo} onClick={() => setUndoOpen(true)} className="gap-1.5">
          <Undo2 size={15} />
          Undo
        </Button>
        <Button variant="outline" size="md" disabled={disabled} onClick={() => setMoreOpen(true)} className="gap-1.5">
          <MoreHorizontal size={15} />
          More
        </Button>
      </div>

      <BottomSheet open={undoOpen} onOpenChange={setUndoOpen} title="Undo Last Ball?">
        <div className="flex flex-col gap-4 pb-2">
          <p className="text-[13px] text-muted">This removes the most recent ball from the innings and restores the previous state.</p>
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="outline" onClick={() => setUndoOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmUndo}>
              Undo
            </Button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet open={moreOpen} onOpenChange={setMoreOpen} title="More">
        <div className="flex flex-col gap-2 pb-4">
          <button
            type="button"
            onClick={handlePenalty}
            className="flex items-center justify-between rounded-[var(--radius-card)] border border-border bg-surface-2 p-3.5 text-left transition-transform active:scale-[0.98]"
          >
            <span className="text-[13.5px] font-semibold">Penalty Runs</span>
            <span className="text-[12px] text-muted-2">+5 to batting team</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
