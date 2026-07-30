"use client";

import { Card } from "@/components/ui/card";
import type { InningsState } from "@/lib/liveScoring/types";
import { inningsRunRate, oversSummary } from "@/lib/liveScoring/scoreboard";
import { oversLabel } from "@/lib/liveScoring/overs";
import { WICKET_LABELS } from "@/lib/liveScoring/wickets";

// Full innings breakdown -- batting card, bowling card, extras, fall of
// wickets, partnerships, over-by-over. Reused by both the innings-break
// screen (live scoring) and the post-match Scorecard (Phase 2), so every
// number a scorer sees mid-match matches what the scorecard shows later.
export function InningsSummary({ innings }: { innings: InningsState }) {
  const batters = Object.values(innings.batters).sort((a, b) => a.battingOrder - b.battingOrder);
  const bowlers = Object.values(innings.bowlers);
  const extras = innings.extrasTotal;
  const extrasTotal = extras.wide + extras["no-ball"] + extras.bye + extras["leg-bye"] + extras.penalty;
  const overs = oversSummary(innings);

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-wood">{innings.battingTeam}</p>
        <p className="tabular-nums mt-0.5 text-[28px] font-extrabold leading-none">
          {innings.totalRuns}
          <span className="text-lg text-muted-2">/{innings.totalWickets}</span>
        </p>
        <p className="mt-1 text-[12px] text-muted-2">
          {oversLabel(innings.legalBalls)} overs · RR {inningsRunRate(innings).toFixed(2)}
        </p>
      </Card>

      <Card className="px-4">
        <p className="pt-3.5 text-[11px] font-bold uppercase tracking-wide text-wood">Batting</p>
        <div className="divide-y divide-white/[0.06] pb-1">
          {batters.map((b) => (
            <div key={b.name} className="flex items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">{b.name}</p>
                <p className="truncate text-[10.5px] text-muted-2">
                  {b.isOut && b.dismissal ? WICKET_LABELS[b.dismissal.type] : b.isRetired ? "Retired" : "Not out"}
                </p>
              </div>
              <p className="tabular-nums flex-none text-[13px] text-muted">
                {b.runs} ({b.balls}) <span className="text-[10.5px] text-muted-2">4s {b.fours} 6s {b.sixes} SR {b.strikeRate}</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="px-4">
        <p className="pt-3.5 text-[11px] font-bold uppercase tracking-wide text-wood">Bowling</p>
        <div className="divide-y divide-white/[0.06] pb-1">
          {bowlers.map((bo) => (
            <div key={bo.name} className="flex items-center justify-between gap-2 py-2.5">
              <p className="truncate text-[13px] font-semibold">{bo.name}</p>
              <p className="tabular-nums flex-none text-[13px] text-muted">
                {bo.oversLabel}-{bo.maidens}-{bo.runsConceded}-{bo.wickets}
                <span className="ml-1.5 text-[10.5px] text-muted-2">Econ {bo.economy}</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="px-4 py-3.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-wood">Extras</p>
        <p className="tabular-nums mt-1.5 text-[13px] text-muted">
          {extrasTotal} <span className="text-[11px] text-muted-2">(w {extras.wide}, nb {extras["no-ball"]}, b {extras.bye}, lb {extras["leg-bye"]}, p {extras.penalty})</span>
        </p>
      </Card>

      {innings.fallOfWickets.length > 0 && (
        <Card className="px-4 py-3.5">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-wood">Fall of Wickets</p>
          <p className="text-[12.5px] leading-relaxed text-muted">
            {innings.fallOfWickets.map((fow) => `${fow.teamRuns}-${fow.wicketNumber} (${fow.playerOut}, ${fow.overLabel})`).join(" · ")}
          </p>
        </Card>
      )}

      {innings.partnerships.length > 0 && (
        <Card className="px-4">
          <p className="pt-3.5 text-[11px] font-bold uppercase tracking-wide text-wood">Partnerships</p>
          <div className="divide-y divide-white/[0.06] pb-1">
            {innings.partnerships.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-2 py-2">
                <p className="truncate text-[12.5px] text-muted">
                  {p.batterA} &amp; {p.batterB}
                </p>
                <p className="tabular-nums flex-none text-[12.5px] font-semibold">
                  {p.runs} ({p.balls})
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {overs.length > 0 && (
        <Card className="px-4 py-3.5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-wood">Over by Over</p>
          <div className="flex flex-col gap-1.5">
            {overs.map((o) => (
              <div key={o.overNumber} className="flex items-center justify-between text-[12px]">
                <span className="w-10 flex-none text-muted-2">Ov {o.overNumber + 1}</span>
                <span className="min-w-0 flex-1 truncate text-muted-2">{o.bowler}</span>
                <span className="tabular-nums flex-none font-semibold">
                  {o.runs} run{o.runs === 1 ? "" : "s"}
                  {o.wickets > 0 ? ` · ${o.wickets}W` : ""}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
