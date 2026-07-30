"use client";

import { HeartPulse } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { InningsState } from "@/lib/liveScoring/types";

export function BatterRows({ innings, onRetire }: { innings: InningsState; onRetire?: () => void }) {
  const names = [innings.strikerName, innings.nonStrikerName].filter((n): n is string => Boolean(n));
  if (names.length === 0) return null;
  return (
    <Card className="divide-y divide-white/[0.06] px-4">
      {names.map((name) => {
        const b = innings.batters[name];
        return (
          <div key={name} className="flex items-center justify-between gap-3 py-2.5">
            <p className="min-w-0 truncate text-[13.5px] font-semibold">
              {name}
              {name === innings.strikerName && <span className="text-blue"> *</span>}
            </p>
            <div className="flex flex-none items-center gap-2">
              <p className="tabular-nums text-[13px] text-muted">
                {b.runs} <span className="text-muted-2">({b.balls})</span>
                <span className="ml-1.5 text-[11px] text-muted-2">SR {b.strikeRate}</span>
              </p>
              {onRetire && name === names[0] && (
                <button
                  type="button"
                  onClick={onRetire}
                  aria-label="Retire batter"
                  className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-muted-2"
                >
                  <HeartPulse size={13} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

export function CurrentBowlerCard({ innings }: { innings: InningsState }) {
  if (!innings.currentBowlerName) return null;
  const bowler = innings.bowlers[innings.currentBowlerName];
  return (
    <Card className="flex items-center justify-between px-4 py-3">
      <p className="text-[13.5px] font-semibold">{bowler.name}</p>
      <p className="tabular-nums text-[13px] text-muted">
        {bowler.oversLabel}-{bowler.maidens}-{bowler.runsConceded}-{bowler.wickets}
        <span className="ml-1.5 text-[11px] text-muted-2">Econ {bowler.economy}</span>
      </p>
    </Card>
  );
}
