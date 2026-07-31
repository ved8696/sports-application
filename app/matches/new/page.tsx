"use client";

import { useRouter } from "next/navigation";
import { Swords, Trophy } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { useMatchCreationStore } from "@/lib/store/match-creation-store";
import { WIZARD_STEPS, STEP_TITLE } from "@/lib/matchCreation/types";
import { cn } from "@/lib/utils";

// Entry point for starting a match: a Single Match is configured from
// scratch in this wizard, a Tournament Match is created from an existing
// tournament's own fixture flow (app/tournaments/*) -- so picking it hands
// off there instead of duplicating tournament/team/rules selection here.
const MATCH_TYPES = [
  {
    key: "single" as const,
    label: "Single Match",
    description: "A one-off match outside of any tournament. Set up teams, squads and rules from scratch.",
    icon: Swords,
  },
  {
    key: "tournament" as const,
    label: "Tournament Match",
    description: "Part of an existing tournament. Teams, players and rules are drawn from that tournament.",
    icon: Trophy,
  },
];

export default function ChooseMatchTypePage() {
  const router = useRouter();
  const { draft, updateDraft } = useMatchCreationStore();
  const selected = draft.tournament.type === "tournament" ? "tournament" : "single";

  function handleContinue() {
    if (selected === "tournament") {
      router.push("/tournaments");
      return;
    }
    if (draft.tournament.type !== "friendly") updateDraft({ tournament: { type: "friendly", name: draft.tournament.name } });
    router.push("/matches/new/details");
  }

  return (
    <WizardShell
      title={STEP_TITLE.tournament}
      stepIndex={WIZARD_STEPS.indexOf("tournament")}
      stepCount={WIZARD_STEPS.length}
      backHref="/dashboard"
      footer={<Button onClick={handleContinue}>Continue</Button>}
    >
      <div className="flex flex-col gap-2.5 pt-1">
        {MATCH_TYPES.map((mt) => (
          <button
            key={mt.key}
            type="button"
            onClick={() => updateDraft({ tournament: { type: mt.key === "single" ? "friendly" : "tournament", name: "" } })}
            className="w-full text-left transition-transform active:scale-[0.98]"
          >
            <div
              className={cn(
                "flex items-start gap-3.5 rounded-[var(--radius-card)] border p-4",
                selected === mt.key ? "border-blue/50 bg-blue/[0.06]" : "border-border bg-surface-2"
              )}
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-wood/15 text-wood">
                <mt.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[14.5px] font-bold">{mt.label}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-2">{mt.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </WizardShell>
  );
}
