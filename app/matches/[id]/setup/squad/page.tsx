"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Plus, Search, X } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FieldError } from "@/components/match-creation/form-field";
import { useMatchSetupStore } from "@/lib/store/match-setup-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useSetupFixture } from "@/lib/matchSetup/useSetupFixture";
import { guardRedirect, validateSquadStep, toFixtureTeams, toFixturePlayingXI, MIN_SQUAD_SIZE, PLAYING_XI_SIZE } from "@/lib/matchSetup/validation";
import { SETUP_STEPS, SETUP_STEP_TITLE, setupStepPath } from "@/lib/matchSetup/types";
import { teamRoster } from "@/lib/matchSetup/roster";
import { matchesSearch } from "@/lib/cricket/helpers";
import { cn } from "@/lib/utils";

type TeamKey = "A" | "B";
type Role = "captain" | "viceCaptain" | "wicketKeeper";

// Squad building, Playing XI selection, and Captain/VC/WK tagging all live on
// one screen -- checking a squad member into the XI reveals inline C/VC/WK
// role chips on that same row, matching the imported wireframe's combined
// "Squad" step instead of three separate pages.
export default function SquadManagementPage() {
  const router = useRouter();
  const { fixtureId, matches, fixtureStatus } = useSetupFixture();
  const { draft, setTeamA, setTeamB, setXIA, setXIB } = useMatchSetupStore();
  const hasHydrated = useHasHydrated(useMatchSetupStore.persist);
  const { updateFixture } = useFixtureStore();
  const [active, setActive] = useState<TeamKey>("A");
  const [query, setQuery] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixtureId || !hasHydrated || fixtureStatus !== "ready") return;
    const redirect = guardRedirect(fixtureId, draft, "squad");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId, hasHydrated, fixtureStatus]);

  const team = active === "A" ? draft.teamA : draft.teamB;
  const xi = active === "A" ? draft.xiA : draft.xiB;
  const setTeam = active === "A" ? setTeamA : setTeamB;
  const setXI = active === "A" ? setXIA : setXIB;

  const suggestions = useMemo(() => {
    const roster = teamRoster(matches, team.name);
    return roster.filter((name) => !team.squad.includes(name) && matchesSearch([name], query));
  }, [matches, team.name, team.squad, query]);

  const sortedSquad = useMemo(() => [...team.squad].sort((a, b) => a.localeCompare(b)), [team.squad]);

  const errors = validateSquadStep(draft);
  const exactMatchExists = team.squad.some((p) => p.toLowerCase() === query.trim().toLowerCase());

  function addPlayer(name: string) {
    const trimmed = name.trim();
    if (!trimmed || team.squad.includes(trimmed)) return;
    setTeam({ squad: [...team.squad, trimmed] });
    setQuery("");
  }

  function removePlayer(name: string) {
    setTeam({ squad: team.squad.filter((p) => p !== name) });
    if (!xi.players.includes(name)) return;
    setXI({
      players: xi.players.filter((p) => p !== name),
      captain: xi.captain === name ? null : xi.captain,
      viceCaptain: xi.viceCaptain === name ? null : xi.viceCaptain,
      wicketKeeper: xi.wicketKeeper === name ? null : xi.wicketKeeper,
    });
  }

  function toggleXI(name: string) {
    if (xi.players.includes(name)) {
      setXI({
        players: xi.players.filter((p) => p !== name),
        captain: xi.captain === name ? null : xi.captain,
        viceCaptain: xi.viceCaptain === name ? null : xi.viceCaptain,
        wicketKeeper: xi.wicketKeeper === name ? null : xi.wicketKeeper,
      });
    } else if (xi.players.length < PLAYING_XI_SIZE) {
      setXI({ players: [...xi.players, name] });
    }
  }

  function toggleRole(role: Role, name: string) {
    setXI({ [role]: xi[role] === name ? null : name });
  }

  async function handleNext() {
    setTouched(true);
    if (errors.teamA) {
      setActive("A");
      return;
    }
    if (errors.teamB) {
      setActive("B");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateFixture(fixtureId, { teams: toFixtureTeams(draft), playingXI: toFixturePlayingXI(draft) });
      router.push(setupStepPath(fixtureId, "toss"));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save the squad.");
      setSubmitting(false);
    }
  }

  return (
    <WizardShell
      title={SETUP_STEP_TITLE.squad}
      stepIndex={SETUP_STEPS.indexOf("squad")}
      stepCount={SETUP_STEPS.length}
      backHref={setupStepPath(fixtureId, "team-b")}
      footer={
        <div className="flex flex-col gap-2.5">
          {submitError && (
            <p className="flex items-center gap-1.5 text-xs text-red">
              <AlertTriangle size={13} /> {submitError}
            </p>
          )}
          <Button onClick={handleNext} disabled={submitting}>
            {submitting ? "Saving…" : "Continue"}
          </Button>
        </div>
      }
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
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search or add a player…" className="pl-10" />
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
                <button key={name} type="button" onClick={() => addPlayer(name)} className="w-full text-left transition-transform active:scale-[0.98]">
                  <Card className="flex items-center justify-between gap-3 p-3.5">
                    <span className="text-[13.5px] font-semibold">{name}</span>
                    <Plus size={15} className="flex-none text-blue" />
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-[12.5px]",
            xi.players.length === PLAYING_XI_SIZE ? "border-blue/50 bg-blue/[0.06] text-foreground" : "border-border bg-surface text-muted"
          )}
        >
          <span className="font-semibold">{xi.players.length}</span> of {PLAYING_XI_SIZE} selected · C, WK required
        </div>

        {sortedSquad.length === 0 ? (
          <Card className="py-8 text-center text-xs text-muted">No players in this squad yet.</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedSquad.map((name) => {
              const inXI = xi.players.includes(name);
              const atMax = xi.players.length >= PLAYING_XI_SIZE;
              return (
                <Card key={name} className="flex flex-col gap-2.5 p-3.5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleXI(name)}
                      disabled={!inXI && atMax}
                      aria-label={inXI ? `Remove ${name} from Playing XI` : `Add ${name} to Playing XI`}
                      className={cn(
                        "flex h-6 w-6 flex-none items-center justify-center rounded-md border transition-colors disabled:opacity-40",
                        inXI ? "border-blue bg-blue text-white" : "border-border bg-surface text-transparent"
                      )}
                    >
                      <Check size={14} />
                    </button>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{name}</span>
                    <button
                      type="button"
                      onClick={() => removePlayer(name)}
                      aria-label={`Remove ${name}`}
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-[9px] border border-red/30 bg-red/10 text-red"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {inXI && (
                    <div className="flex flex-wrap gap-1.5 pl-9">
                      <RoleChip label="C" active={xi.captain === name} onClick={() => toggleRole("captain", name)} />
                      <RoleChip label="VC" active={xi.viceCaptain === name} onClick={() => toggleRole("viceCaptain", name)} />
                      <RoleChip label="WK" active={xi.wicketKeeper === name} onClick={() => toggleRole("wicketKeeper", name)} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {touched && <FieldError>{active === "A" ? errors.teamA : errors.teamB}</FieldError>}
        {!touched && team.squad.length < MIN_SQUAD_SIZE && (
          <p className="text-xs text-muted-2">
            Add at least {MIN_SQUAD_SIZE - team.squad.length} more player{MIN_SQUAD_SIZE - team.squad.length === 1 ? "" : "s"} to reach the {MIN_SQUAD_SIZE}-player minimum.
          </p>
        )}
      </div>
    </WizardShell>
  );
}

function RoleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors",
        active ? "bg-wood text-background" : "border border-border bg-surface text-muted-2"
      )}
    >
      {label}
    </button>
  );
}
