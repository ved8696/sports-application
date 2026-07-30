"use client";

import { useState } from "react";
import { Users, CircleDot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerPickerSheet } from "./player-picker-sheet";
import { useLiveScoringStore } from "@/lib/store/live-scoring-store";
import { battingFirstTeam, bowlingFirstTeam } from "@/lib/liveScoring/initialize";
import type { Fixture } from "@/lib/cricket/fixture-types";
import type { LucideIcon } from "lucide-react";

type Slot = "striker" | "nonStriker" | "bowler" | null;

// Shown before the first ball -- Sprint 3's Match Ready screen confirms
// captains/keeper but doesn't ask who opens, which is genuinely a
// live-scoring-time decision (openers are often only finalized at the
// crease). Reuses Fixture.teams/toss/playingXI directly, no new model.
export function OpenerSetup({ fixture }: { fixture: Fixture }) {
  const start = useLiveScoringStore((s) => s.start);
  const status = useLiveScoringStore((s) => s.status);
  const error = useLiveScoringStore((s) => s.error);

  const battingTeam = battingFirstTeam(fixture);
  const bowlingTeam = bowlingFirstTeam(fixture);
  const battingXI = fixture.playingXI?.find((x) => x.team === battingTeam)?.players ?? [];
  const bowlingXI = fixture.playingXI?.find((x) => x.team === bowlingTeam)?.players ?? [];

  const [striker, setStriker] = useState<string | null>(null);
  const [nonStriker, setNonStriker] = useState<string | null>(null);
  const [bowler, setBowler] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Slot>(null);

  const ready = Boolean(striker && nonStriker && bowler);

  function handleStart() {
    if (!striker || !nonStriker || !bowler) return;
    start(fixture.id, { strikerName: striker, nonStrikerName: nonStriker, bowlerName: bowler });
  }

  return (
    <div className="flex flex-col gap-4 pt-1">
      <Card className="p-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-wood">First Innings</p>
        <p className="mt-1 text-[15px] font-bold">
          {battingTeam} <span className="font-normal text-muted-2">batting</span>
        </p>
        <p className="text-[12px] text-muted-2">{bowlingTeam} bowling</p>
      </Card>

      <PickerRow label="Opening Striker" value={striker} icon={Users} onPress={() => setSheet("striker")} />
      <PickerRow label="Opening Non-Striker" value={nonStriker} icon={Users} onPress={() => setSheet("nonStriker")} />
      <PickerRow label="Opening Bowler" value={bowler} icon={CircleDot} onPress={() => setSheet("bowler")} />

      {error && <p className="text-xs text-red">{error}</p>}

      <Button onClick={handleStart} disabled={!ready || status === "loading"}>
        {status === "loading" ? "Starting…" : "Start Innings"}
      </Button>

      <PlayerPickerSheet
        open={sheet === "striker"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Opening Striker"
        players={battingXI}
        disabledNames={nonStriker ? [nonStriker] : []}
        onSelect={(name) => {
          setStriker(name);
          setSheet(null);
        }}
      />
      <PlayerPickerSheet
        open={sheet === "nonStriker"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Opening Non-Striker"
        players={battingXI}
        disabledNames={striker ? [striker] : []}
        onSelect={(name) => {
          setNonStriker(name);
          setSheet(null);
        }}
      />
      <PlayerPickerSheet
        open={sheet === "bowler"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Opening Bowler"
        players={bowlingXI}
        onSelect={(name) => {
          setBowler(name);
          setSheet(null);
        }}
      />
    </div>
  );
}

function PickerRow({ label, value, icon: Icon, onPress }: { label: string; value: string | null; icon: LucideIcon; onPress: () => void }) {
  return (
    <button type="button" onClick={onPress} className="w-full text-left transition-transform active:scale-[0.98]">
      <Card className="flex items-center gap-3 p-3.5">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-wood/15 text-wood">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] text-muted-2">{label}</p>
          <p className="truncate text-[14px] font-semibold">{value ?? "Tap to select"}</p>
        </div>
      </Card>
    </button>
  );
}
