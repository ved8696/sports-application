"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle, MapPin, CalendarClock, Trophy, Layers, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { venueLabel } from "@/lib/matchCreation/defaults";
import { resumeSetupStep, setupStepPath } from "@/lib/matchSetup/types";
import type { Fixture } from "@/lib/cricket/fixture-types";

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(hhmm: string): string {
  if (!hhmm) return "—";
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function MatchDetailsScreen() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/fixtures/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Match not found.");
        return res.json();
      })
      .then((data: { fixture: Fixture }) => {
        if (!cancelled) {
          setFixture(data.fixture);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header
        className="flex flex-none items-center gap-3 px-5 pb-4"
        style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}
      >
        <Link
          href="/matches"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-lg font-extrabold">Match Details</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {status === "loading" && (
          <Card className="flex items-center justify-center gap-2.5 py-14 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-blue" />
            Loading match…
          </Card>
        )}

        {status === "error" && (
          <Card className="flex flex-col items-center gap-2 py-14 text-center">
            <AlertTriangle size={18} className="text-red" />
            <p className="text-sm font-semibold">Match not found</p>
            <p className="text-xs text-muted">This fixture may have been removed.</p>
          </Card>
        )}

        {status === "ready" && fixture && (
          <div className="flex flex-col gap-5">
            <Card className="p-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-wood">{fixture.status}</p>
              <h2 className="mt-1 text-xl font-extrabold leading-tight">{fixture.name}</h2>
              <p className="mt-1 text-[12.5px] text-muted-2">{fixture.tournament.name}</p>
            </Card>

            <div className="grid grid-cols-2 gap-2.5">
              <Card className="p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-2">Format</p>
                <p className="mt-1 text-[14px] font-bold">{fixture.format}</p>
              </Card>
              <Card className="p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-2">Overs</p>
                <p className="mt-1 text-[14px] font-bold">{fixture.overs ?? "Unlimited"}</p>
              </Card>
            </div>

            <Card className="divide-y divide-white/[0.06] px-4">
              <InfoRow icon={Trophy} label="Tournament" value={fixture.tournament.name} />
              <InfoRow icon={MapPin} label="Venue" value={venueLabel(fixture.venue)} />
              <InfoRow
                icon={CalendarClock}
                label="Date & Time"
                value={`${formatDate(fixture.date)} · ${formatTime(fixture.startTime)}`}
              />
              <InfoRow icon={Layers} label="Match Type" value={fixture.matchType} />
            </Card>

            <Button asChild>
              {fixture.status === "Completed" ? (
                <Link href={`/matches/${fixture.id}/scorecard`}>View Scorecard</Link>
              ) : fixture.status === "Live" ? (
                <Link href={`/matches/${fixture.id}/live`}>Continue Scoring</Link>
              ) : (
                <Link href={setupStepPath(fixture.id, resumeSetupStep(fixture))}>
                  {fixture.toss ? "View Match Ready" : "Continue to Toss"}
                </Link>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] bg-wood/12 text-wood">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] text-muted-2">{label}</p>
        <p className="truncate text-[13px] font-semibold">{value}</p>
      </div>
    </div>
  );
}
