import { Star, Award, Target, Hand } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { PotmResult } from "@/lib/liveScoring/types";

export function PotmCard({ potm }: { potm: PotmResult }) {
  return (
    <Card className="px-4 py-3.5">
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-wood">Player of the Match</p>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-wood/15 text-wood">
          <Star size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-extrabold">{potm.playerOfMatch.name}</p>
          <p className="truncate text-[11.5px] text-muted-2">{potm.playerOfMatch.team}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat icon={Award} label="Best Batter" name={potm.bestBatter.name} />
        <MiniStat icon={Target} label="Best Bowler" name={potm.bestBowler.name} />
        {potm.bestFielder && <MiniStat icon={Hand} label="Best Fielder" name={potm.bestFielder.name} />}
      </div>
    </Card>
  );
}

function MiniStat({ icon: Icon, label, name }: { icon: typeof Award; label: string; name: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-2.5 text-center">
      <Icon size={13} className="mx-auto text-muted-2" />
      <p className="mt-1 truncate text-[10px] text-muted-2">{label}</p>
      <p className="truncate text-[11.5px] font-bold">{name}</p>
    </div>
  );
}
