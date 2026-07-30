"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FieldLabel, FieldError } from "@/components/match-creation/form-field";
import { useMatchCreationStore } from "@/lib/store/match-creation-store";
import { guardRedirect, validateDetailsStep } from "@/lib/matchCreation/validation";
import { WIZARD_STEPS, STEP_TITLE } from "@/lib/matchCreation/types";
import { MATCH_FORMATS, BALL_TYPES, GENDER_OPTIONS, AGE_GROUPS, MATCH_TYPES } from "@/lib/matchCreation/defaults";

const SELECT_CLASS =
  "h-[52px] w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40";

export default function MatchDetailsStep() {
  const router = useRouter();
  const { draft, updateDraft, setFormat } = useMatchCreationStore();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = validateDetailsStep(draft);

  useEffect(() => {
    const redirect = guardRedirect(draft, "details");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markTouched(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleNext() {
    setTouched({ name: true, tournamentName: true, format: true, overs: true, ballType: true, gender: true });
    if (Object.keys(errors).length > 0) return;
    router.push("/matches/new/rules");
  }

  return (
    <WizardShell
      title={STEP_TITLE.details}
      stepIndex={WIZARD_STEPS.indexOf("details")}
      stepCount={WIZARD_STEPS.length}
      backHref="/matches/new"
      footer={<Button onClick={handleNext}>Continue</Button>}
    >
      <div className="flex flex-col gap-5 pt-1">
        <div>
          <FieldLabel htmlFor="match-name">Match Name</FieldLabel>
          <Input
            id="match-name"
            value={draft.name}
            onChange={(e) => updateDraft({ name: e.target.value })}
            onBlur={() => markTouched("name")}
            placeholder="e.g. Willow CC vs Riverside CC"
            error={touched.name ? errors.name : undefined}
          />
          {touched.name && <FieldError>{errors.name}</FieldError>}
        </div>

        <div>
          <FieldLabel>Tournament</FieldLabel>
          {draft.tournament.type === "tournament" ? (
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5">
              <span className="truncate text-[14px] font-semibold">{draft.tournament.name || "—"}</span>
              <Link href="/matches/new" className="flex-none text-[12px] font-semibold text-blue">
                Change
              </Link>
            </div>
          ) : (
            <>
              <Input
                value={draft.tournament.name}
                onChange={(e) => updateDraft({ tournament: { ...draft.tournament, name: e.target.value } })}
                onBlur={() => markTouched("tournamentName")}
                placeholder={draft.tournament.type === "league" ? "League name" : "Name this friendly fixture"}
                error={touched.tournamentName ? errors.tournamentName : undefined}
              />
              {touched.tournamentName && <FieldError>{errors.tournamentName}</FieldError>}
            </>
          )}
        </div>

        <div>
          <FieldLabel>Match Format</FieldLabel>
          <SegmentedControl
            options={MATCH_FORMATS.map((f) => ({ value: f, label: f === "Custom" ? "Custom Overs" : f }))}
            value={draft.format as (typeof MATCH_FORMATS)[number] | null}
            onChange={(f) => {
              setFormat(f);
              markTouched("format");
            }}
          />
          {touched.format && <FieldError>{errors.format}</FieldError>}
        </div>

        <div>
          <FieldLabel htmlFor="overs">Overs per Innings</FieldLabel>
          {draft.format === "Custom" ? (
            <>
              <Input
                id="overs"
                type="number"
                min={1}
                value={draft.overs ?? ""}
                onChange={(e) => updateDraft({ overs: e.target.value ? Number(e.target.value) : null })}
                onBlur={() => markTouched("overs")}
                placeholder="e.g. 16"
                error={touched.overs ? errors.overs : undefined}
              />
              {touched.overs && <FieldError>{errors.overs}</FieldError>}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-surface px-4 py-3.5 text-[14px] text-muted">
              {draft.format === "Test"
                ? "Unlimited — governed by days, not overs"
                : draft.overs
                  ? `${draft.overs} overs per innings`
                  : "Choose a format first"}
            </div>
          )}
        </div>

        <div>
          <FieldLabel>Ball Type</FieldLabel>
          <SegmentedControl
            options={BALL_TYPES.map((b) => ({ value: b, label: b }))}
            value={draft.ballType}
            onChange={(b) => {
              updateDraft({ ballType: b });
              markTouched("ballType");
            }}
          />
          {touched.ballType && <FieldError>{errors.ballType}</FieldError>}
        </div>

        <div>
          <FieldLabel>Gender</FieldLabel>
          <SegmentedControl
            options={GENDER_OPTIONS}
            value={draft.gender}
            onChange={(g) => {
              updateDraft({ gender: g });
              markTouched("gender");
            }}
          />
          {touched.gender && <FieldError>{errors.gender}</FieldError>}
        </div>

        <div>
          <FieldLabel htmlFor="age-group">Age Group</FieldLabel>
          <select
            id="age-group"
            value={draft.ageGroup}
            onChange={(e) => updateDraft({ ageGroup: e.target.value })}
            className={SELECT_CLASS}
          >
            {AGE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel htmlFor="match-type">Match Type</FieldLabel>
          <select
            id="match-type"
            value={draft.matchType}
            onChange={(e) => updateDraft({ matchType: e.target.value })}
            className={SELECT_CLASS}
          >
            {MATCH_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </WizardShell>
  );
}
