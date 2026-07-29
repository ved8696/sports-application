"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Trophy, Swords } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionCard } from "@/components/match-creation/option-card";
import { FieldError } from "@/components/match-creation/form-field";
import { useCricketStore } from "@/lib/store/cricket-store";
import { useMatchCreationStore } from "@/lib/store/match-creation-store";
import { uniqueSorted, matchesSearch } from "@/lib/cricket/helpers";
import { validateTournamentStep } from "@/lib/matchCreation/validation";
import { cn } from "@/lib/utils";
import type { FixtureCreationType } from "@/lib/cricket/fixture-types";

const CREATION_TYPES: { type: FixtureCreationType; label: string; description: string; icon: typeof Trophy }[] = [
  {
    type: "friendly",
    label: "Friendly Match",
    description: "A casual, one-off fixture with no league or tournament.",
    icon: Swords,
  },
  { type: "league", label: "League Match", description: "Part of an ongoing league season.", icon: Users },
  {
    type: "tournament",
    label: "Tournament Match",
    description: "Part of a knockout or group-stage tournament.",
    icon: Trophy,
  },
];

function recentTournamentNames(matches: { tournament: { name: string }; dates: string[] }[], limit = 5): string[] {
  const latest = new Map<string, string>();
  for (const m of matches) {
    const name = m.tournament.name;
    const date = m.dates[0] ?? "";
    if (!name) continue;
    if (!latest.has(name) || date > (latest.get(name) as string)) latest.set(name, date);
  }
  return Array.from(latest.entries())
    .sort((a, b) => b[1].localeCompare(a[1]))
    .slice(0, limit)
    .map(([name]) => name);
}

export default function TournamentSelectionPage() {
  const router = useRouter();
  const { matches, status, load } = useCricketStore();
  const { draft, updateDraft } = useMatchCreationStore();
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const tournamentNames = useMemo(() => uniqueSorted(matches.map((m) => m.tournament.name)), [matches]);
  const recent = useMemo(() => recentTournamentNames(matches), [matches]);
  const filtered = useMemo(
    () => tournamentNames.filter((name) => matchesSearch([name], search)),
    [tournamentNames, search]
  );

  const errors = validateTournamentStep(draft);

  function selectExisting(name: string) {
    updateDraft({ tournament: { type: "tournament", name } });
  }

  function selectType(type: FixtureCreationType) {
    updateDraft({ tournament: { type, name: type === "tournament" ? draft.tournament.name : "" } });
  }

  function handleNext() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    router.push("/matches/new/details");
  }

  return (
    <WizardShell step="tournament" backHref="/dashboard" footer={<Button onClick={handleNext}>Continue</Button>}>
      <div className="flex flex-col gap-5 pt-1">
        <section>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-wood">Start a new match</p>
          <div className="flex flex-col gap-2">
            {CREATION_TYPES.map((ct) => (
              <button
                key={ct.type}
                type="button"
                onClick={() => selectType(ct.type)}
                className="w-full text-left transition-transform active:scale-[0.98]"
              >
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-card)] border p-3.5",
                    draft.tournament.type === ct.type ? "border-blue/50 bg-blue/[0.06]" : "border-border bg-surface-2"
                  )}
                >
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-wood/15 text-wood">
                    <ct.icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold">{ct.label}</p>
                    <p className="truncate text-[11px] text-muted-2">{ct.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {touched && <FieldError>{errors.type}</FieldError>}
        </section>

        {draft.tournament.type === "tournament" && (
          <section>
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-wood">Select tournament</p>
            <div className="relative mb-3">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tournaments…"
                className="pl-10"
              />
            </div>

            {!search && recent.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">Recent</p>
                <div className="flex flex-col gap-2">
                  {recent.map((name) => (
                    <OptionCard
                      key={name}
                      title={name}
                      selected={draft.tournament.name === name}
                      onClick={() => selectExisting(name)}
                    />
                  ))}
                </div>
              </div>
            )}

            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">
              {search ? "Results" : "All tournaments"}
            </p>
            <div className="flex flex-col gap-2">
              {status !== "ready" ? (
                <p className="py-6 text-center text-xs text-muted">Loading tournaments…</p>
              ) : filtered.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">No tournaments match your search.</p>
              ) : (
                filtered.map((name) => (
                  <OptionCard
                    key={name}
                    title={name}
                    selected={draft.tournament.name === name}
                    onClick={() => selectExisting(name)}
                  />
                ))
              )}
            </div>
            {touched && <FieldError>{errors.name}</FieldError>}
          </section>
        )}
      </div>
    </WizardShell>
  );
}
