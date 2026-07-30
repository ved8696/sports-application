"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Search } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/match-creation/form-field";
import { useTournamentCreationStore } from "@/lib/store/tournament-creation-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { useCricketStore } from "@/lib/store/cricket-store";
import { extractFilterOptions } from "@/lib/cricket/filters";
import { matchesSearch } from "@/lib/cricket/helpers";
import { guardRedirect, validateTeamsStep } from "@/lib/tournament/validation";
import { WIZARD_STEPS, STEP_TITLE } from "@/lib/tournament/types";

export default function TournamentTeamsStep() {
  const router = useRouter();
  const { draft, toggleTeam, addNewTeam } = useTournamentCreationStore();
  const hasHydrated = useHasHydrated(useTournamentCreationStore.persist);
  const { matches, playerBios, status, load } = useCricketStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!hasHydrated) return;
    const redirect = guardRedirect(draft, "teams");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  const existingTeams = useMemo(
    () => (status === "ready" ? extractFilterOptions(matches, playerBios).teams : []),
    [matches, playerBios, status]
  );
  const selectedNames = new Set(draft.teams.map((t) => t.name));
  const visibleTeams = existingTeams.filter((name) => matchesSearch([name], query));
  const exactMatch = existingTeams.some((name) => name.toLowerCase() === query.trim().toLowerCase());

  const errors = validateTeamsStep(draft);

  function handleNext() {
    if (Object.keys(errors).length > 0) return;
    router.push("/tournaments/new/review");
  }

  if (!hasHydrated) return null;

  return (
    <WizardShell
      title={STEP_TITLE.teams}
      stepIndex={WIZARD_STEPS.indexOf("teams")}
      stepCount={WIZARD_STEPS.length}
      backHref="/tournaments/new/rules"
      footer={
        <div className="flex flex-col gap-2">
          <p className="text-center text-[11px] font-semibold text-muted-2">
            {draft.teams.length} of {draft.numberOfTeams} selected
          </p>
          {errors.teams && <FieldError>{errors.teams}</FieldError>}
          <Button onClick={handleNext} disabled={Object.keys(errors).length > 0}>
            Continue
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pt-1">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search teams" className="pl-10" />
        </div>

        <div className="flex flex-col gap-2">
          {visibleTeams.map((name) => {
            const selected = selectedNames.has(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleTeam(name)}
                className="flex items-center gap-2.5 rounded-[10px] border border-border p-2"
              >
                <span
                  className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] ${
                    selected ? "bg-foreground text-background" : "border border-border"
                  }`}
                >
                  {selected && <Check size={12} />}
                </span>
                <span className="h-[26px] w-[26px] flex-none rounded-full bg-surface-3" />
                <span className={`text-[12px] font-semibold ${selected ? "text-foreground" : "text-muted"}`}>{name}</span>
              </button>
            );
          })}

          {query.trim() && !exactMatch && (
            <button
              type="button"
              onClick={() => {
                addNewTeam(query);
                setQuery("");
              }}
              className="rounded-[10px] border border-dashed border-border p-2.5 text-center text-[11px] font-semibold text-muted"
            >
              <Plus size={13} className="mr-1 inline" /> Add &quot;{query.trim()}&quot; as a new team
            </button>
          )}

          {!query.trim() && (
            <p className="rounded-[10px] border border-dashed border-border p-2.5 text-center text-[11px] font-semibold text-muted-2">
              Search above to add a new team
            </p>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
