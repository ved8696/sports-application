"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { OptionCard } from "@/components/match-creation/option-card";
import { FieldLabel, FieldError } from "@/components/match-creation/form-field";
import { useMatchSetupStore } from "@/lib/store/match-setup-store";
import { useSetupFixture } from "@/lib/matchSetup/useSetupFixture";
import { validateTeamAStep } from "@/lib/matchSetup/validation";
import { SETUP_STEPS, SETUP_STEP_TITLE, setupStepPath } from "@/lib/matchSetup/types";
import { recentTeamNames, teamGroups } from "@/lib/matchSetup/teams";
import { matchesSearch } from "@/lib/cricket/helpers";

export default function TeamASelectPage() {
  const router = useRouter();
  const { fixtureId, matches, matchStatus } = useSetupFixture();
  const { draft, setTeamA } = useMatchSetupStore();
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const groups = useMemo(() => teamGroups(matches), [matches]);
  const recent = useMemo(() => recentTeamNames(matches), [matches]);
  const errors = validateTeamAStep(draft);

  function saveNewTeam() {
    if (!newTeamName.trim()) return;
    setTeamA({ name: newTeamName.trim() });
    setSheetOpen(false);
    setNewTeamName("");
  }

  function handleNext() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    router.push(setupStepPath(fixtureId, "team-b"));
  }

  return (
    <WizardShell
      title={SETUP_STEP_TITLE["team-a"]}
      stepIndex={SETUP_STEPS.indexOf("team-a")}
      stepCount={SETUP_STEPS.length}
      backHref={`/matches/${fixtureId}`}
      footer={<Button onClick={handleNext}>Continue</Button>}
    >
      <div className="flex flex-col gap-4 pt-1">
        {draft.teamA.name && (
          <div className="rounded-xl border border-blue/50 bg-blue/[0.06] px-4 py-3.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">Selected</p>
            <p className="mt-0.5 text-[14px] font-bold">{draft.teamA.name}</p>
          </div>
        )}

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teams…" className="pl-10" />
        </div>

        <Button variant="outline" size="md" onClick={() => setSheetOpen(true)} className="justify-start gap-2.5">
          <Plus size={16} />
          Add New Team
        </Button>

        {!search && recent.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">Recently Used</p>
            <div className="flex flex-col gap-2">
              {recent.map((name) => (
                <OptionCard key={name} title={name} selected={draft.teamA.name === name} onClick={() => setTeamA({ name })} />
              ))}
            </div>
          </div>
        )}

        {matchStatus !== "ready" ? (
          <p className="py-6 text-center text-xs text-muted">Loading teams…</p>
        ) : (
          groups.map((group) => {
            const filtered = group.teams.filter((name) => matchesSearch([name], search));
            if (filtered.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">{group.label}</p>
                <div className="flex flex-col gap-2">
                  {filtered.map((name) => (
                    <OptionCard key={name} title={name} selected={draft.teamA.name === name} onClick={() => setTeamA({ name })} />
                  ))}
                </div>
              </div>
            );
          })
        )}
        {touched && <FieldError>{errors.name}</FieldError>}
      </div>

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Add New Team">
        <div className="flex flex-col gap-4 pb-2">
          <div>
            <FieldLabel htmlFor="new-team-name">Team Name</FieldLabel>
            <Input
              id="new-team-name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. Willow CC"
            />
          </div>
          <Button onClick={saveNewTeam}>Save Team</Button>
        </div>
      </BottomSheet>
    </WizardShell>
  );
}
