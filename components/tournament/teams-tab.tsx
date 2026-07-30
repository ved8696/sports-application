"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { matchesSearch } from "@/lib/cricket/helpers";
import type { StandingsRow } from "@/lib/tournament/standings";
import type { Tournament } from "@/lib/tournament/types";

export function TeamsTab({ tournament, standings }: { tournament: Tournament; standings: StandingsRow[] }) {
  const [query, setQuery] = useState("");
  const rowByTeam = new Map(standings.map((r) => [r.team, r]));

  const sortedTeams = useMemo(() => {
    return [...tournament.teams].sort((a, b) => (rowByTeam.get(b.name)?.points ?? 0) - (rowByTeam.get(a.name)?.points ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournament.teams, standings]);

  const filtered = sortedTeams.filter((t) => matchesSearch([t.name], query));

  return (
    <div className="flex flex-col gap-3 px-5 pt-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search teams" className="h-9 pl-9 text-xs" />
        </div>
        <span className="whitespace-nowrap text-[11px] font-semibold text-muted">Sort: Points</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.map((team) => {
          const row = rowByTeam.get(team.name);
          return (
            <Card key={team.name} className="flex items-center gap-2.5 p-3">
              <div className="h-10 w-10 flex-none rounded-full bg-surface-3" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold">{team.name}</p>
                <p className="truncate text-[10px] text-muted-2">Captain: {team.captain ?? "Not set"}</p>
                <RecentForm team={team.name} row={row} />
              </div>
              <span className="flex-none text-[11px] font-bold text-muted">›</span>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="py-8 text-center text-xs text-muted">No teams match.</p>}
      </div>
    </div>
  );
}

function RecentForm({ row }: { team: string; row: StandingsRow | undefined }) {
  if (!row || row.played === 0) return null;
  const dots = Array.from({ length: Math.min(5, row.played) }, (_, i) => i < row.won);
  return (
    <div className="mt-1 flex gap-[3px]">
      {dots.map((won, i) => (
        <span key={i} className={`h-[10px] w-[10px] rounded-full ${won ? "bg-foreground" : "border border-border"}`} />
      ))}
    </div>
  );
}
