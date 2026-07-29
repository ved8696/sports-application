"use client";

import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCricketDashboard } from "@/lib/cricket/useCricketDashboard";

export default function MatchesPage() {
  const { status, matchSummaries } = useCricketDashboard();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex-none px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <h1 className="text-lg font-extrabold">Matches</h1>
        <p className="text-xs text-muted">Every match currently loaded from /data</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {status !== "ready" ? (
          <Card className="flex items-center justify-center gap-2.5 py-14 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-blue" />
            Loading…
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {matchSummaries.map((m) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-bold">
                      {m.teamA} vs {m.teamB}
                    </p>
                    <p className="truncate text-[11px] text-muted-2">
                      {m.venue} · {m.date}
                    </p>
                  </div>
                  <div className="flex-none text-right">
                    <p className="tabular-nums text-xs">
                      {m.scoreA ?? "—"} → {m.scoreB ?? "—"}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-wood">{m.result ?? m.status}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
