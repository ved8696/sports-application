"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Loader2, AlertTriangle, PlusSquare, UserPlus, Shield, FileBarChart, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCricketDashboard } from "@/lib/cricket/useCricketDashboard";
import { useFixtureStore } from "@/lib/store/fixture-store";
import type { ActivityEntry } from "@/app/api/data-activity/route";

function formatFixtureDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

const QUICK_ACTIONS = [
  { label: "Start New Match", href: "/matches/new", icon: PlusSquare, tone: "wood" as const },
  { label: "Score a Match", href: "/score", icon: CalendarClock, tone: "blue" as const },
  { label: "View All Matches", href: "/matches", icon: Shield, tone: "wood" as const },
  { label: "Add Player", href: "/players", icon: UserPlus, tone: "blue" as const },
];

export default function DashboardPage() {
  const { status, error, isEmpty, matchCount, kpis, matchSummaries } = useCricketDashboard();
  const { fixtures, load: loadFixtures } = useFixtureStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    // sessionStorage doesn't exist during SSR, so this can only be read after
    // mount -- syncing from that external, browser-only store is exactly
    // what this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserEmail(sessionStorage.getItem("willow_user_email"));
    fetch("/api/data-activity")
      .then((r) => r.json())
      .then((d) => setActivity(d.entries ?? []))
      .catch(() => setActivity([]));
    loadFixtures();
  }, [loadFixtures]);

  const displayName = userEmail ? userEmail.split("@")[0] : null;
  const recentMatches = matchSummaries.slice(0, 4);
  const upcomingFixtures = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return fixtures
      .filter((f) => f.date >= today)
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
      .slice(0, 4);
  }, [fixtures]);

  return (
    <div className="flex flex-1 flex-col">
      <header
        className="flex flex-none items-center justify-between px-5 pb-4"
        style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}
      >
        <div>
          <p className="text-xs text-muted">{greeting()}</p>
          <h1 className="text-lg font-extrabold">{displayName ?? "Welcome back"}</h1>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted">
          <Bell size={16} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {(status === "idle" || status === "loading") && (
          <Card className="flex items-center justify-center gap-2.5 py-14 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-blue" />
            Loading match data…
          </Card>
        )}

        {status === "error" && (
          <Card className="flex flex-col items-center gap-2 py-14 text-center">
            <AlertTriangle size={18} className="text-red" />
            <p className="text-sm font-semibold">Couldn&apos;t load cricket data</p>
            <p className="text-xs text-muted">{error}</p>
          </Card>
        )}

        {status === "ready" && isEmpty && (
          <Card className="flex flex-col items-center gap-2 py-14 text-center">
            <p className="text-sm font-semibold">No match data found</p>
            <p className="max-w-xs text-xs text-muted">
              Drop Cricsheet-format match JSON files into <code>/data</code> and reload.
            </p>
          </Card>
        )}

        {status === "ready" && !isEmpty && (
          <div className="flex flex-col gap-6">
            {/* ---------- Statistics ---------- */}
            <section>
              <SectionLabel>Statistics · {matchCount} matches loaded</SectionLabel>
              <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
                {kpis.map((kpi) => (
                  <Card key={kpi.label} className="w-[128px] flex-none p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-2">{kpi.label}</p>
                    <p className="tabular-nums mt-1.5 text-xl font-extrabold">
                      {kpi.value.toLocaleString(undefined, { maximumFractionDigits: kpi.decimals ?? 0 })}
                      {kpi.suffix ?? ""}
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            {/* ---------- Quick Actions ---------- */}
            <section>
              <SectionLabel>Quick Actions</SectionLabel>
              <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
                {QUICK_ACTIONS.map((action) => (
                  <Link key={action.href} href={action.href} className="flex-none">
                    <Card className="flex w-[112px] flex-col gap-2.5 p-3.5 active:scale-[0.97] transition-transform">
                      <div
                        className={
                          "flex h-8 w-8 items-center justify-center rounded-[9px] " +
                          (action.tone === "wood" ? "bg-wood/15 text-wood" : "bg-blue/15 text-blue")
                        }
                      >
                        <action.icon size={15} />
                      </div>
                      <p className="text-xs font-bold leading-tight">{action.label}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            {/* ---------- Recent Matches ---------- */}
            <section>
              <SectionLabel>Recent Matches</SectionLabel>
              <Card className="divide-y divide-white/[0.06] px-4">
                {recentMatches.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted">No matches in the loaded data yet.</p>
                ) : (
                  recentMatches.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold">
                          {m.teamA} vs {m.teamB}
                        </p>
                        <p className="truncate text-[11px] text-muted-2">{m.venue}</p>
                      </div>
                      <div className="flex-none text-right">
                        <p className="tabular-nums text-xs">
                          {m.scoreA ?? "—"} → {m.scoreB ?? "—"}
                        </p>
                        <p className="mt-0.5 text-[10.5px] text-wood">{m.result ?? m.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </section>

            {/* ---------- Upcoming Matches ---------- */}
            <section>
              <SectionLabel>Upcoming Matches</SectionLabel>
              {upcomingFixtures.length === 0 ? (
                <Card className="flex flex-col items-center gap-2 py-8 text-center">
                  <CalendarClock size={20} className="text-muted-2" />
                  <p className="text-[13px] font-semibold">Nothing scheduled yet</p>
                  <p className="max-w-[240px] text-[11.5px] text-muted-2">
                    Tap &quot;Start New Match&quot; above to create your first fixture.
                  </p>
                </Card>
              ) : (
                <Card className="divide-y divide-white/[0.06] px-4">
                  {upcomingFixtures.map((f) => (
                    <Link
                      key={f.id}
                      href={`/matches/${f.id}`}
                      className="flex items-center justify-between gap-3 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold">{f.name}</p>
                        <p className="truncate text-[11px] text-muted-2">
                          {f.venue.name} · {f.format}
                        </p>
                      </div>
                      <div className="flex-none text-right">
                        <p className="tabular-nums text-xs">{formatFixtureDate(f.date)}</p>
                        <p className="mt-0.5 text-[10.5px] text-wood">{f.status}</p>
                      </div>
                    </Link>
                  ))}
                </Card>
              )}
            </section>

            {/* ---------- Recent Activity ---------- */}
            <section>
              <SectionLabel>Recent Activity</SectionLabel>
              <Card className="px-4">
                {activity.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted">No activity yet.</p>
                ) : (
                  <div className="flex flex-col gap-3 py-3">
                    {activity.map((a) => (
                      <div key={a.file} className="flex gap-2.5">
                        <div className="mt-0.5 h-full w-[2px] flex-none rounded-full bg-wood" />
                        <p className="text-[12.5px] leading-relaxed text-muted">
                          Match data <span className="font-semibold text-foreground">{a.matchId}</span> updated ·{" "}
                          <span className="text-muted-2">{timeAgo(a.modifiedAt)}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>

            <p className="pt-1 text-center text-[10.5px] text-muted-2">
              <FileBarChart size={11} className="mr-1 inline" />
              Statistics computed live from the /data folder — nothing here is mocked.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-2.5 border-l-2 border-wood pl-2 text-[11px] font-bold uppercase tracking-wide text-wood"
    >
      {children}
    </motion.p>
  );
}
