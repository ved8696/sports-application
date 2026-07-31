import { CheckCircle2, Circle, Flag, Play, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildMatchTimeline, type TimelineEntry, type TimelineKind } from "@/lib/liveScoring/timeline";
import type { Fixture } from "@/lib/cricket/fixture-types";
import type { LiveMatchState } from "@/lib/liveScoring/types";

const ICON: Record<TimelineKind, typeof Trophy> = {
  toss: Trophy,
  start: Play,
  wicket: CheckCircle2,
  partnership: Users,
  break: Flag,
  complete: CheckCircle2,
};

export function TimelineTab({ fixture, state }: { fixture: Fixture; state: LiveMatchState }) {
  const entries = buildMatchTimeline(fixture, state);

  return (
    <div className="relative flex flex-col gap-0 pl-1">
      {entries.map((entry, i) => (
        <TimelineRow key={entry.key} entry={entry} isLast={i === entries.length - 1} />
      ))}
    </div>
  );
}

function TimelineRow({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  const Icon = entry.done ? ICON[entry.kind] : Circle;
  return (
    <div className="relative flex gap-3.5 pb-5">
      {!isLast && <div className="absolute bottom-0 left-[15px] top-8 w-px bg-border" />}
      <div
        className={cn(
          "z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full",
          entry.done ? "bg-wood/16 text-wood" : "border border-dashed border-border bg-surface-2 text-muted-2"
        )}
      >
        <Icon size={15} />
      </div>
      <div className="pt-1">
        <p className={cn("text-[13px] font-bold", !entry.done && "text-muted-2")}>{entry.title}</p>
        <p className={cn("mt-0.5 text-[11px] leading-relaxed", entry.done ? "text-muted" : "text-muted-2")}>{entry.detail}</p>
      </div>
    </div>
  );
}
