"use client";

import { useState } from "react";
import { Crown, Shield, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";
import type { Fixture, FixturePlayingXI } from "@/lib/cricket/fixture-types";
import type { BatterInningsStats, BowlerInningsStats, LiveMatchState } from "@/lib/liveScoring/types";

type TeamKey = "A" | "B";

function battingLine(stats?: BatterInningsStats): string | null {
  if (!stats) return null;
  return `${stats.runs} (${stats.balls}) · SR ${stats.strikeRate}`;
}

function bowlingLine(stats?: BowlerInningsStats): string | null {
  if (!stats) return null;
  return `${stats.oversLabel}-${stats.maidens}-${stats.runsConceded}-${stats.wickets} · Econ ${stats.economy}`;
}

export function PlayersTab({ fixture, state }: { fixture: Fixture; state: LiveMatchState | null }) {
  const [active, setActive] = useState<TeamKey>("A");
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!fixture.playingXI) {
    return <p className="py-10 text-center text-xs text-muted">Playing XI hasn&apos;t been confirmed yet.</p>;
  }

  const xi: FixturePlayingXI = active === "A" ? fixture.playingXI[0] : fixture.playingXI[1];

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        options={[
          { value: "A", label: fixture.playingXI[0].team },
          { value: "B", label: fixture.playingXI[1].team },
        ]}
        value={active}
        onChange={(v) => {
          setActive(v as TeamKey);
          setExpanded(null);
        }}
      />

      <div className="flex flex-col gap-2">
        {xi.players.map((name) => {
          const batting = state ? (state.innings1.batters[name] ?? state.innings2?.batters[name]) : undefined;
          const bowling = state ? (state.innings1.bowlers[name] ?? state.innings2?.bowlers[name]) : undefined;
          const isOpen = expanded === name;

          return (
            <Card key={name} className="p-3.5">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : name)}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[13px] font-bold">
                    {name}
                    {name === xi.captain && <Crown size={12} className="flex-none text-wood" />}
                    {name === xi.viceCaptain && <span className="flex-none text-[9px] font-bold text-wood">VC</span>}
                    {name === xi.wicketKeeper && <Shield size={12} className="flex-none text-blue" />}
                  </p>
                  {(battingLine(batting) || bowlingLine(bowling)) && (
                    <p className="tabular-nums mt-0.5 truncate text-[11px] text-muted-2">
                      {battingLine(batting)}
                      {battingLine(batting) && bowlingLine(bowling) ? " · " : ""}
                      {bowlingLine(bowling)}
                    </p>
                  )}
                </div>
                <ChevronDown size={15} className={cn("flex-none text-muted-2 transition-transform", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                  <Stat label="Runs" value={batting ? String(batting.runs) : "—"} />
                  <Stat label="Balls" value={batting ? String(batting.balls) : "—"} />
                  <Stat label="4s / 6s" value={batting ? `${batting.fours} / ${batting.sixes}` : "—"} />
                  <Stat label="Overs" value={bowling ? bowling.oversLabel : "—"} />
                  <Stat label="Wickets" value={bowling ? String(bowling.wickets) : "—"} />
                  <Stat label="Economy" value={bowling ? String(bowling.economy) : "—"} />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9.5px] font-semibold uppercase tracking-wide text-muted-2">{label}</p>
      <p className="tabular-nums mt-0.5 text-[13px] font-bold">{value}</p>
    </div>
  );
}
