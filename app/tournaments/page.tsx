"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Loader2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTournamentStore } from "@/lib/store/tournament-store";
import { TOURNAMENT_FORMAT_LABEL } from "@/lib/tournament/types";
import { matchesSearch } from "@/lib/cricket/helpers";

type Filter = "All" | "Active" | "Upcoming" | "Completed";

function formatDateShort(iso: string): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TournamentDashboardPage() {
  const { tournaments, status, error, load } = useTournamentStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  useEffect(() => {
    load();
  }, [load]);

  const visible = tournaments.filter((t) => !t.archived);
  const active = visible.filter((t) => t.status === "Active");
  const upcoming = visible.filter((t) => t.status === "Draft");
  const completed = visible.filter((t) => t.status === "Completed");

  const filtered = useMemo(() => {
    const byFilter =
      filter === "All" ? visible : filter === "Active" ? active : filter === "Upcoming" ? upcoming : completed;
    return byFilter.filter((t) => matchesSearch([t.name], query));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, filter, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center justify-between px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <h1 className="text-lg font-extrabold">Tournaments</h1>
        <Link
          href="/tournaments/new"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background"
          aria-label="Create tournament"
        >
          <Plus size={18} />
        </Link>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-24">
        <div className="relative mb-3">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tournaments" className="pl-10" />
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {(["All", "Active", "Upcoming", "Completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-none rounded-2xl px-3.5 py-1.5 text-[11px] font-semibold ${
                filter === f ? "bg-foreground text-background" : "border border-border text-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mb-5 flex gap-2">
          <Card className="flex-1 p-2.5 text-center">
            <p className="text-lg font-bold">{active.length}</p>
            <p className="text-[10px] font-medium text-muted-2">Active</p>
          </Card>
          <Card className="flex-1 p-2.5 text-center">
            <p className="text-lg font-bold">{visible.length}</p>
            <p className="text-[10px] font-medium text-muted-2">Total</p>
          </Card>
          <Card className="flex-1 p-2.5 text-center">
            <p className="text-lg font-bold">{completed.length}</p>
            <p className="text-[10px] font-medium text-muted-2">Completed</p>
          </Card>
        </div>

        {(status === "idle" || status === "loading") && (
          <Card className="flex items-center justify-center gap-2.5 py-14 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-blue" />
            Loading tournaments…
          </Card>
        )}

        {status === "error" && (
          <Card className="flex flex-col items-center gap-2 py-14 text-center">
            <AlertTriangle size={18} className="text-red" />
            <p className="text-sm font-semibold">Couldn&apos;t load tournaments</p>
            <p className="text-xs text-muted">{error}</p>
          </Card>
        )}

        {status === "ready" && filtered.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-14 text-center text-sm text-muted">
            {query || filter !== "All" ? "No tournaments match." : "No tournaments yet. Create your first one."}
          </Card>
        )}

        {status === "ready" && filtered.length > 0 && (
          <div className="flex flex-col gap-5">
            {(filter === "All" || filter === "Active") && active.some((t) => filtered.includes(t)) && (
              <section>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-2">Active</p>
                <div className="flex flex-col gap-2.5">
                  {active.filter((t) => filtered.includes(t)).map((t) => (
                    <TournamentCard key={t.id} id={t.id} name={t.name} sub={`${t.teams.length} Teams · ${TOURNAMENT_FORMAT_LABEL[t.format]}`} badge="LIVE" />
                  ))}
                </div>
              </section>
            )}

            {(filter === "All" || filter === "Upcoming") && upcoming.some((t) => filtered.includes(t)) && (
              <section>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-2">Upcoming</p>
                <div className="flex flex-col gap-2.5">
                  {upcoming.filter((t) => filtered.includes(t)).map((t) => (
                    <TournamentCard key={t.id} id={t.id} name={t.name} sub={`${t.teams.length} Teams · ${TOURNAMENT_FORMAT_LABEL[t.format]}`} badge={formatDateShort(t.startDate)} outline />
                  ))}
                </div>
              </section>
            )}

            {(filter === "All" || filter === "Completed") && completed.some((t) => filtered.includes(t)) && (
              <section>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-2">Completed</p>
                <div className="flex flex-col gap-2.5">
                  {completed.filter((t) => filtered.includes(t)).map((t) => (
                    <TournamentCard key={t.id} id={t.id} name={t.name} sub={`${t.teams.length} Teams · ${TOURNAMENT_FORMAT_LABEL[t.format]}`} badge="DONE" outline />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <div className="flex-none px-5 pb-4" style={{ paddingBottom: "calc(var(--safe-bottom) + 16px)" }}>
        <Button asChild>
          <Link href="/tournaments/new">
            <Plus size={16} /> Create Tournament
          </Link>
        </Button>
      </div>
    </div>
  );
}

function TournamentCard({ id, name, sub, badge, outline }: { id: string; name: string; sub: string; badge: string; outline?: boolean }) {
  return (
    <Link href={`/tournaments/${id}`}>
      <Card className="flex items-center gap-2.5 p-3">
        <div className="h-10 w-10 flex-none rounded-[10px] bg-surface-3" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">{name}</p>
          <p className="truncate text-[11px] text-muted-2">{sub}</p>
        </div>
        <span
          className={
            outline
              ? "flex-none rounded-lg border border-border px-2 py-0.5 text-[9px] font-bold text-muted"
              : "flex-none rounded-lg bg-foreground px-2 py-0.5 text-[9px] font-bold text-background"
          }
        >
          {badge}
        </span>
      </Card>
    </Link>
  );
}
