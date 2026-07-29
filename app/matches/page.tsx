"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCricketDashboard } from "@/lib/cricket/useCricketDashboard";
import { useFixtureStore } from "@/lib/store/fixture-store";

export default function MatchesPage() {
  const { status, matchSummaries } = useCricketDashboard();
  const { fixtures, status: fixtureStatus, load: loadFixtures } = useFixtureStore();

  useEffect(() => {
    loadFixtures();
  }, [loadFixtures]);

  const upcoming = [...fixtures].sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex-none px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <h1 className="text-lg font-extrabold">Matches</h1>
        <p className="text-xs text-muted">Scheduled fixtures and completed matches from /data</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-6">
          <section>
            <p className="mb-2.5 border-l-2 border-wood pl-2 text-[11px] font-bold uppercase tracking-wide text-wood">
              Upcoming
            </p>
            {fixtureStatus === "loading" ? (
              <Card className="flex items-center justify-center gap-2.5 py-8 text-sm text-muted">
                <Loader2 size={16} className="animate-spin text-blue" />
                Loading…
              </Card>
            ) : upcoming.length === 0 ? (
              <Card className="py-8 text-center text-xs text-muted">No matches scheduled yet.</Card>
            ) : (
              <div className="flex flex-col gap-2.5">
                {upcoming.map((f) => (
                  <Link key={f.id} href={`/matches/${f.id}`}>
                    <Card className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-bold">{f.name}</p>
                          <p className="truncate text-[11px] text-muted-2">
                            {f.venue.name} · {f.date}
                          </p>
                        </div>
                        <div className="flex-none text-right">
                          <p className="tabular-nums text-xs">{f.format}</p>
                          <p className="mt-0.5 text-[10.5px] text-wood">{f.status}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <p className="mb-2.5 border-l-2 border-wood pl-2 text-[11px] font-bold uppercase tracking-wide text-wood">
              Completed
            </p>
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
          </section>
        </div>
      </div>
    </div>
  );
}
