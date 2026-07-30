"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WicketType } from "@/lib/liveScoring/types";
import { WICKET_LABELS, isAllowedOnFreeHit, requiresFielder } from "@/lib/liveScoring/wickets";

const DELIVERY_WICKET_TYPES: WicketType[] = ["bowled", "caught", "lbw", "run-out", "stumped", "hit-wicket", "obstructing-field"];
const RUN_OUT_RUNS = [0, 1, 2, 3];

export interface WicketConfirmInput {
  type: WicketType;
  playerOut: string;
  fielder?: string;
  runsCompleted: number;
}

export function WicketSheet({
  open,
  onOpenChange,
  strikerName,
  nonStrikerName,
  fieldingXI,
  isFreeHit,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strikerName: string;
  nonStrikerName: string;
  fieldingXI: string[];
  isFreeHit: boolean;
  onConfirm: (input: WicketConfirmInput) => void;
}) {
  const [type, setType] = useState<WicketType | null>(null);
  const [playerOut, setPlayerOut] = useState(strikerName);
  const [fielder, setFielder] = useState<string | null>(null);
  const [runsCompleted, setRunsCompleted] = useState(0);

  const availableTypes = DELIVERY_WICKET_TYPES.filter((t) => !isFreeHit || isAllowedOnFreeHit(t));
  const fielderRequired = type ? requiresFielder(type) : false;
  const canConfirm = Boolean(type) && (!fielderRequired || Boolean(fielder));

  function confirm() {
    if (!type || !canConfirm) return;
    onConfirm({ type, playerOut, fielder: fielder ?? undefined, runsCompleted: type === "run-out" ? runsCompleted : 0 });
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Wicket">
      <div className="flex flex-col gap-5 pb-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">How Out</p>
          <div className="flex flex-col gap-2">
            {availableTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-[13.5px] font-semibold transition-transform active:scale-[0.98]",
                  type === t ? "border-red/50 bg-red/10 text-red" : "border-border bg-surface text-foreground"
                )}
              >
                {WICKET_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {type === "run-out" && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Batter Out</p>
            <div className="grid grid-cols-2 gap-2">
              {[strikerName, nonStrikerName].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPlayerOut(name)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-[13px] font-semibold",
                    playerOut === name ? "border-blue/50 bg-blue/10 text-blue" : "border-border bg-surface text-foreground"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {type === "run-out" && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Runs Completed</p>
            <div className="grid grid-cols-4 gap-2">
              {RUN_OUT_RUNS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRunsCompleted(r)}
                  className={cn(
                    "h-11 rounded-xl border text-[15px] font-bold",
                    runsCompleted === r ? "border-blue/50 bg-blue/15 text-blue" : "border-border bg-surface text-foreground"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {fielderRequired && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Fielder</p>
            <div className="flex flex-wrap gap-2">
              {fieldingXI.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFielder(name)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] font-semibold",
                    fielder === name ? "border-blue/50 bg-blue/15 text-blue" : "border-border bg-surface text-muted"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button onClick={confirm} disabled={!canConfirm}>
          Confirm Wicket
        </Button>
      </div>
    </BottomSheet>
  );
}
