import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { MatchReport } from "@/lib/liveScoring/types";

export function MatchReportCard({ report }: { report: MatchReport }) {
  return (
    <Card className="px-4 py-3.5">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-wood">
        <Sparkles size={12} />
        Match Report
      </p>
      <p className="text-[13px] leading-relaxed text-muted">{report.turningPoint}</p>

      {report.highestPartnership && (
        <p className="mt-2 text-[12px] text-muted-2">
          Highest partnership: <span className="font-semibold text-foreground">{report.highestPartnership.runs}</span> between{" "}
          {report.highestPartnership.batters[0]} &amp; {report.highestPartnership.batters[1]}
        </p>
      )}

      {report.topPerformers.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">Top Performers</p>
          <div className="flex flex-col gap-1">
            {report.topPerformers.map((p) => (
              <p key={p.name} className="text-[12.5px] text-muted">
                <span className="font-semibold text-foreground">{p.name}</span> — {p.description}
              </p>
            ))}
          </div>
        </div>
      )}

      {report.highlights.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">Highlights Timeline</p>
          <div className="flex flex-col gap-1">
            {report.highlights.slice(0, 8).map((h, i) => (
              <p key={i} className="text-[11.5px] text-muted-2">
                <span className="tabular-nums text-foreground">
                  Inn {h.inningsNumber} · {h.overLabel}
                </span>{" "}
                — {h.label}
              </p>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
