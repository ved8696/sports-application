"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RetireSheet({
  open,
  onOpenChange,
  strikerName,
  nonStrikerName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strikerName: string;
  nonStrikerName: string;
  onConfirm: (playerOut: string, type: "retired-hurt" | "retired-out") => void;
}) {
  const [player, setPlayer] = useState(strikerName);
  const [type, setType] = useState<"retired-hurt" | "retired-out">("retired-hurt");

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Retire Batter">
      <div className="flex flex-col gap-5 pb-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Batter</p>
          <div className="grid grid-cols-2 gap-2">
            {[strikerName, nonStrikerName].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setPlayer(name)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-[13px] font-semibold",
                  player === name ? "border-blue/50 bg-blue/10 text-blue" : "border-border bg-surface text-foreground"
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Reason</p>
          <div className="grid grid-cols-2 gap-2">
            {(["retired-hurt", "retired-out"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-[13px] font-semibold",
                  type === t ? "border-red/50 bg-red/10 text-red" : "border-border bg-surface text-foreground"
                )}
              >
                {t === "retired-hurt" ? "Retired Hurt" : "Retired Out"}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={() => onConfirm(player, type)}>Confirm</Button>
      </div>
    </BottomSheet>
  );
}
