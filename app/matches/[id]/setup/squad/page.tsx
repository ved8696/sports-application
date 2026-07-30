"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X, Pencil, ArrowUpDown } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FieldLabel, FieldError } from "@/components/match-creation/form-field";
import { useMatchSetupStore } from "@/lib/store/match-setup-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { useSetupFixture } from "@/lib/matchSetup/useSetupFixture";
import { guardRedirect, validateSquadStep, MIN_SQUAD_SIZE } from "@/lib/matchSetup/validation";
import { SETUP_STEPS, SETUP_STEP_TITLE, setupStepPath } from "@/lib/matchSetup/types";
import { teamRoster } from "@/lib/matchSetup/roster";
import { matchesSearch } from "@/lib/cricket/helpers";

type TeamKey = "A" | "B";

export default function SquadManagementPage() {
  const router = useRouter();
  const { fixtureId, matches } = useSetupFixture();
  const { draft, setTeamA, setTeamB } = useMatchSetupStore();
  const hasHydrated = useHasHydrated(useMatchSetupStore.persist);
  const [active, setActive] = useState<TeamKey>("A");
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!fixtureId || !hasHydrated) return;
    const redirect = guardRedirect(fixtureId, draft, "squad");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId, hasHydrated]);

  const team = active === "A" ? draft.teamA : draft.teamB;
  const setTeam = active === "A" ? setTeamA : setTeamB;

  const suggestions = useMemo(() => {
    const roster = teamRoster(matches, team.name);
    return roster.filter((name) => !team.squad.includes(name) && matchesSearch([name], query));
  }, [matches, team.name, team.squad, query]);

  const sortedSquad = useMemo(() => {
    const list = [...team.squad].sort((a, b) => a.localeCompare(b));
    return sortDesc ? list.reverse() : list;
  }, [team.squad, sortDesc]);

  const errors = validateSquadStep(draft);

  function addPlayer(name: string) {
    const trimmed = name.trim();
    if (!trimmed || team.squad.includes(trimmed)) return;
    setTeam({ squad: [...team.squad, trimmed] });
    setQuery("");
  }

  function removePlayer(name: string) {
    setTeam({ squad: team.squad.filter((p) => p !== name) });
  }

  function startEdit(name: string) {
    setEditIndex(team.squad.indexOf(name));
    setEditValue(name);
  }

  function saveEdit() {
    if (editIndex === null) return;
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const next = [...team.squad];
    next[editIndex] = trimmed;
    setTeam({ squad: next });
    setEditIndex(null);
    setEditValue("");
  }

  function handleNext() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    router.push(setupStepPath(fixtureId, "playing-xi"));
  }

  const exactMatchExists = team.squad.some((p) => p.toLowerCase() === query.trim().toLowerCase());

  return (
    <WizardShell
      title={SETUP_STEP_TITLE.squad}
      stepIndex={SETUP_STEPS.indexOf("squad")}
      stepCount={SETUP_STEPS.length}
      backHref={setupStepPath(fixtureId, "team-b")}
      footer={<Button onClick={handleNext}>Continue</Button>}
    >
      <div className="flex flex-col gap-4 pt-1">
        <SegmentedControl
          options={[
            { value: "A", label: draft.teamA.name || "Team A" },
            { value: "B", label: draft.teamB.name || "Team B" },
          ]}
          value={active}
          onChange={(v) => setActive(v as TeamKey)}
        />

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or add a player…"
            className="pl-10"
          />
        </div>

        {query.trim() && !exactMatchExists && (
          <Button variant="outline" size="md" onClick={() => addPlayer(query)} className="justify-start gap-2.5">
            <Plus size={16} />
            Add &quot;{query.trim()}&quot; to squad
          </Button>
        )}

        {suggestions.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">
              {query.trim() ? "From match history" : `${team.name || "Team"}'s known players`}
            </p>
            <div className="flex flex-col gap-2">
              {suggestions.slice(0, 8).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addPlayer(name)}
                  className="w-full text-left transition-transform active:scale-[0.98]"
                >
                  <Card className="flex items-center justify-between gap-3 p-3.5">
                    <span className="text-[13.5px] font-semibold">{name}</span>
                    <Plus size={15} className="flex-none text-blue" />
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">
            Squad · {team.squad.length} player{team.squad.length === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            onClick={() => setSortDesc((d) => !d)}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue"
          >
            <ArrowUpDown size={12} />
            {sortDesc ? "Z–A" : "A–Z"}
          </button>
        </div>

        {sortedSquad.length === 0 ? (
          <Card className="py-8 text-center text-xs text-muted">No players in this squad yet.</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedSquad.map((name) => (
              <Card key={name} className="flex items-center justify-between gap-3 p-3.5">
                <span className="min-w-0 truncate text-[13.5px] font-semibold">{name}</span>
                <div className="flex flex-none items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => startEdit(name)}
                    className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-border bg-surface text-muted"
                    aria-label={`Edit ${name}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePlayer(name)}
                    className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-red/30 bg-red/10 text-red"
                    aria-label={`Remove ${name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {touched && (
          <FieldError>{active === "A" ? errors.teamA : errors.teamB}</FieldError>
        )}
        {!touched && team.squad.length < MIN_SQUAD_SIZE && (
          <p className="text-xs text-muted-2">
            Add at least {MIN_SQUAD_SIZE - team.squad.length} more player{MIN_SQUAD_SIZE - team.squad.length === 1 ? "" : "s"} to reach the {MIN_SQUAD_SIZE}-player minimum.
          </p>
        )}
      </div>

      <BottomSheet open={editIndex !== null} onOpenChange={(open) => !open && setEditIndex(null)} title="Edit Player">
        <div className="flex flex-col gap-4 pb-2">
          <div>
            <FieldLabel htmlFor="edit-player-name">Player Name</FieldLabel>
            <Input id="edit-player-name" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
          </div>
          <Button onClick={saveEdit}>Save Changes</Button>
        </div>
      </BottomSheet>
    </WizardShell>
  );
}
