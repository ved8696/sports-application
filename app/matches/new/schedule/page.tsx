"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FieldLabel, FieldError } from "@/components/match-creation/form-field";
import { useMatchCreationStore } from "@/lib/store/match-creation-store";
import { guardRedirect, validateScheduleStep } from "@/lib/matchCreation/validation";
import { DAY_NIGHT_OPTIONS, commonTimeZones } from "@/lib/matchCreation/defaults";

const SELECT_CLASS =
  "h-[52px] w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DateTimeStep() {
  const router = useRouter();
  const { draft, updateDraft } = useMatchCreationStore();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const timeZones = commonTimeZones();

  useEffect(() => {
    if (!draft.timeZone) {
      updateDraft({ timeZone: timeZones[0] });
    }
    const redirect = guardRedirect(draft, "schedule");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errors = validateScheduleStep(draft);

  function markTouched(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleNext() {
    setTouched({ date: true, startTime: true, timeZone: true, dayNight: true });
    if (Object.keys(errors).length > 0) return;
    router.push("/matches/new/review");
  }

  return (
    <WizardShell step="schedule" backHref="/matches/new/venue" footer={<Button onClick={handleNext}>Continue</Button>}>
      <div className="flex flex-col gap-5 pt-1">
        <div>
          <FieldLabel htmlFor="match-date">Match Date</FieldLabel>
          <Input
            id="match-date"
            type="date"
            min={todayIso()}
            value={draft.date}
            onChange={(e) => updateDraft({ date: e.target.value })}
            onBlur={() => markTouched("date")}
            error={touched.date ? errors.date : undefined}
          />
          {touched.date && <FieldError>{errors.date}</FieldError>}
        </div>

        <div>
          <FieldLabel htmlFor="start-time">Start Time</FieldLabel>
          <Input
            id="start-time"
            type="time"
            value={draft.startTime}
            onChange={(e) => updateDraft({ startTime: e.target.value })}
            onBlur={() => markTouched("startTime")}
            error={touched.startTime ? errors.startTime : undefined}
          />
          {touched.startTime && <FieldError>{errors.startTime}</FieldError>}
        </div>

        <div>
          <FieldLabel htmlFor="time-zone">Time Zone</FieldLabel>
          <select
            id="time-zone"
            value={draft.timeZone}
            onChange={(e) => updateDraft({ timeZone: e.target.value })}
            onBlur={() => markTouched("timeZone")}
            className={SELECT_CLASS}
          >
            {timeZones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          {touched.timeZone && <FieldError>{errors.timeZone}</FieldError>}
        </div>

        <div>
          <FieldLabel>Day / Night</FieldLabel>
          <SegmentedControl
            options={DAY_NIGHT_OPTIONS.map((d) => ({ value: d, label: d }))}
            value={draft.dayNight}
            onChange={(d) => {
              updateDraft({ dayNight: d });
              markTouched("dayNight");
            }}
          />
          {touched.dayNight && <FieldError>{errors.dayNight}</FieldError>}
        </div>
      </div>
    </WizardShell>
  );
}
