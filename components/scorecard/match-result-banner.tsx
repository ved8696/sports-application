import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { MatchResultDetail } from "@/lib/liveScoring/types";

export function MatchResultBanner({ result, matchName, tournament }: { result: MatchResultDetail; matchName: string; tournament: string }) {
  return (
    <Card className="flex flex-col items-center gap-2 p-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-wood/15 text-wood">
        <Trophy size={20} />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-2">{tournament}</p>
      <h2 className="text-lg font-extrabold leading-tight">{matchName}</h2>
      <p className="text-[14px] font-bold text-wood">{result.summaryText}</p>
    </Card>
  );
}
