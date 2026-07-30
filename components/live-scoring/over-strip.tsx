"use client";

import { cn } from "@/lib/utils";
import type { InningsState } from "@/lib/liveScoring/types";
import { recentBallsDisplay } from "@/lib/liveScoring/scoreboard";

export function OverStrip({ innings }: { innings: InningsState }) {
  const balls = recentBallsDisplay(innings.currentOverEvents, 6);
  return (
    <div>
      <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">This Over</p>
      <div className="flex gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => {
          const ball = balls[i];
          return (
            <div
              key={i}
              className={cn(
                "flex h-8 w-8 flex-none items-center justify-center rounded-full border text-[11px] font-bold",
                !ball
                  ? "border-border bg-surface text-muted-2"
                  : ball.isWicket
                    ? "border-red/50 bg-red/15 text-red"
                    : ball.isBoundary
                      ? "border-wood/50 bg-wood/15 text-wood"
                      : "border-border bg-surface-2 text-foreground"
              )}
            >
              {ball?.label ?? ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
