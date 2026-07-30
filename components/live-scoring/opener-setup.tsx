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

// Shown before the first ball of either innings -- Sprint 3's Match Ready
// screen confirms captains/keeper but doesn't ask who opens, which is
// genuinely a live-scoring-time decision. Reuses Fixture.teams/toss/
// playingXI directly, no new model. For innings 1, batting/bowling teams
// come from the toss; for innings 2 the caller passes them explicitly (the
// side that bowled first now bats).
export function OpenerSetup({
  fixture,
  inningsNumber = 1,
  battingTeam: battingTeamProp,
  bowlingTeam: bowlingTeamProp,
}: {
  fixture: Fixture;
  inningsNumber?: 1 | 2;
  battingTeam?: string;
  bowlingTeam?: string;
}) {
  const start = useLiveScoringStore((s) => s.start);
  const startSecondInnings = useLiveScoringStore((s) => s.startSecondInnings);
  const status = useLiveScoringStore((s) => s.status);
  const saving = useLiveScoringStore((s) => s.saving);
  const error = useLiveScoringStore((s) => s.error);

  const battingTeam = battingTeamProp ?? battingFirstTeam(fixture);
  const bowlingTeam = bowlingTeamProp ?? bowlingFirstTeam(fixture);
  const battingXI = fixture.playingXI?.find((x) => x.team === battingTeam)?.players ?? [];
  const bowlingXI = fixture.playingXI?.find((x) => x.team === bowlingTeam)?.players ?? [];

  const [striker, setStriker] = useState<string | null>(null);
  const [nonStriker, setNonStriker] = useState<string | null>(null);
  const [bowler, setBowler] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Slot>(null);

  const ready = Boolean(striker && nonStriker && bowler);
  const busy = status === "loading" || saving;

  function handleStart() {
    if (!striker || !nonStriker || !bowler) return;
    const openers = { strikerName: striker, nonStrikerName: nonStriker, bowlerName: bowler };
    if (inningsNumber === 2) {
      startSecondInnings(openers);
    } else {
      start(fixture.id, openers);
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-1">
      <Card className="p-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-wood">
          {inningsNumber === 2 ? "Second Innings" : "First Innings"}
        </p>
        <p className="mt-1 text-[15px] font-bold">
          {battingTeam} <span className="font-normal text-muted-2">batting</span>
        </p>
        <p className="text-[12px] text-muted-2">{bowlingTeam} bowling</p>
      </Card>

      <PickerRow label="Opening Striker" value={striker} icon={Users} onPress={() => setSheet("striker")} />
      <PickerRow label="Opening Non-Striker" value={nonStriker} icon={Users} onPress={() => setSheet("nonStriker")} />
      <PickerRow label="Opening Bowler" value={bowler} icon={CircleDot} onPress={() => setSheet("bowler")} />

      {error && <p className="text-xs text-red">{error}</p>}

      <Button onClick={handleStart} disabled={!ready || busy}>
        {busy ? "Starting…" : "Start Innings"}
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
