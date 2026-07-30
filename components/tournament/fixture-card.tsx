import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Fixture } from "@/lib/cricket/fixture-types";
import { venueLabel } from "@/lib/matchCreation/defaults";

function formatDate(iso: string, startTime: string): string {
  const d = new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (!startTime) return d;
  const [h, m] = startTime.split(":").map(Number);
  const t = new Date();
  t.setHours(h, m);
  return `${d}, ${t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const action =
    fixture.status === "Live"
      ? { label: "Watch Live", href: `/matches/${fixture.id}/live`, solid: true }
      : fixture.status === "Completed"
        ? { label: "View Scorecard", href: `/matches/${fixture.id}/scorecard`, solid: false }
        : { label: "Start Match", href: `/matches/${fixture.id}`, solid: true };

  const [teamA, teamB] = fixture.teams ?? [];

  return (
    <Card className="p-3">
      {fixture.round && <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-muted-2">{fixture.round}</p>}
      <div className="flex items-center justify-between text-[12px] font-bold">
        <span>{teamA?.name ?? fixture.name.split(" vs ")[0]}</span>
        <span className="text-[10px] font-normal text-muted-2">vs</span>
        <span>{teamB?.name ?? fixture.name.split(" vs ")[1]}</span>
      </div>
      <p className="my-1.5 text-[10px] text-muted-2">
        {venueLabel(fixture.venue)} · {formatDate(fixture.date, fixture.startTime)}
      </p>
      <span
        className={`mb-1.5 inline-block rounded-lg px-2 py-0.5 text-[9px] font-bold ${
          fixture.status === "Live" ? "bg-foreground text-background" : "border border-border text-muted"
        }`}
      >
        {fixture.status === "Live" ? "LIVE" : fixture.status === "Completed" ? "COMPLETED" : "UPCOMING"}
      </span>
      <Link
        href={action.href}
        className={`flex h-[34px] items-center justify-center rounded-full text-[11px] font-bold ${
          action.solid ? "bg-foreground text-background" : "border border-border text-foreground"
        }`}
      >
        {action.label}
      </Link>
    </Card>
  );
}
