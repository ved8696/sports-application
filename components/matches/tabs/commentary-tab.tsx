"use client";

import { useMemo, useState } from "react";
import { SectionLabel } from "@/components/mobile/section-label";
import { cn } from "@/lib/utils";
import { ballCommentary, ballOverLabel } from "@/lib/liveScoring/commentary";
import type { BallEvent, InningsState, LiveMatchState } from "@/lib/liveScoring/types";

type Filter = "all" | "boundaries" | "wickets" | "extras";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "boundaries", label: "Boundaries" },
  { value: "wickets", label: "Wickets" },
  { value: "extras", label: "Extras" },
];

function matchesFilter(event: BallEvent, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "wickets") return Boolean(event.wicket);
  if (filter === "boundaries") return !event.wicket && (event.runsBat === 4 || event.runsBat === 6);
  return Boolean(event.extra);
}

function groupByOver(events: BallEvent[]): { overNumber: number; events: BallEvent[] }[] {
  const groups = new Map<number, BallEvent[]>();
  for (const e of events) {
    const list = groups.get(e.overNumber) ?? [];
    list.push(e);
    groups.set(e.overNumber, list);
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([overNumber, evs]) => ({ overNumber, events: [...evs].reverse() }));
}

export function CommentaryTab({ state }: { state: LiveMatchState }) {
  const [filter, setFilter] = useState<Filter>("all");

  const innings: InningsState[] = [state.innings2, state.innings1].filter((i): i is InningsState => Boolean(i));

  const hasAnyEvents = innings.some((i) => i.events.length > 0);
  if (!hasAnyEvents) {
    return <p className="py-10 text-center text-xs text-muted">Commentary starts with the first delivery.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "flex-none rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold",
              filter === f.value ? "border-foreground bg-foreground text-background" : "border-border text-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {innings.map((inn) => (
        <InningsCommentary key={inn.inningsNumber} innings={inn} filter={filter} />
      ))}
    </div>
  );
}

function InningsCommentary({ innings, filter }: { innings: InningsState; filter: Filter }) {
  const overs = useMemo(() => groupByOver(innings.events), [innings.events]);
  const visibleOvers = overs
    .map((o) => ({ ...o, events: o.events.filter((e) => matchesFilter(e, filter)) }))
    .filter((o) => o.events.length > 0);

  if (visibleOvers.length === 0) return null;

  return (
    <section>
      <SectionLabel>
        {innings.battingTeam} · Innings {innings.inningsNumber}
      </SectionLabel>
      <div className="flex flex-col gap-5">
        {visibleOvers.map((o) => (
          <div key={o.overNumber}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">Over {o.overNumber + 1}</p>
            <div className="relative flex flex-col gap-0 pl-5">
              <div className="absolute bottom-1 left-[5px] top-1 w-px bg-border" />
              {o.events.map((e) => (
                <BallRow key={e.id} event={e} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BallRow({ event }: { event: BallEvent }) {
  const highlight = Boolean(event.wicket) || (!event.wicket && event.runsBat === 6);
  return (
    <div className="relative flex gap-3 py-2">
      <span
        className={cn(
          "tabular-nums relative z-10 -ml-5 flex h-5 w-9 flex-none items-center justify-center rounded-md text-[10px] font-bold",
          event.wicket ? "bg-red text-white" : event.runsBat === 6 || event.runsBat === 4 ? "bg-wood/25 text-wood" : "bg-surface-3 text-muted"
        )}
      >
        {ballOverLabel(event)}
      </span>
      <p className={cn("text-[12px] leading-relaxed", highlight ? "font-semibold text-foreground" : "text-muted")}>
        {ballCommentary(event)}
      </p>
    </div>
  );
}
