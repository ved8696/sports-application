import type { StandingsRow } from "@/lib/tournament/standings";

export function TableTab({ standings }: { standings: StandingsRow[] }) {
  return (
    <div className="px-5 pt-3">
      <div className="mb-2.5 flex gap-3.5 text-[10px] font-medium text-muted-2">
        <span className="flex items-center gap-1">
          <span className="h-[9px] w-[9px] rounded-full bg-foreground" /> Qualified
        </span>
        <span className="flex items-center gap-1">
          <span className="h-[9px] w-[9px] rounded-full border border-foreground" /> Eliminated
        </span>
      </div>

      <div className="grid grid-cols-[16px_1fr_22px_22px_22px_38px_30px] gap-1 border-b border-border py-1.5 text-[9px] font-bold text-muted-2">
        <span>#</span>
        <span>Team</span>
        <span>P</span>
        <span>W</span>
        <span>L</span>
        <span>NRR</span>
        <span>Pts</span>
      </div>

      {standings.map((row, i) => (
        <div
          key={row.team}
          className={`grid grid-cols-[16px_1fr_22px_22px_22px_38px_30px] items-center gap-1 border-b border-border/60 py-2 text-[11px] font-semibold ${
            i % 2 === 0 ? "bg-surface-2" : ""
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${row.qualified ? "bg-foreground" : "border border-foreground"}`} />
          <span className="truncate">{row.team}</span>
          <span>{row.played}</span>
          <span>{row.won}</span>
          <span>{row.lost}</span>
          <span>{row.nrr > 0 ? `+${row.nrr.toFixed(2)}` : row.nrr.toFixed(2)}</span>
          <span className="font-bold">{row.points}</span>
        </div>
      ))}

      {standings.length === 0 && <p className="py-8 text-center text-xs text-muted">No standings yet.</p>}
    </div>
  );
}
