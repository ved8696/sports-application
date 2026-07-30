"use client";

import { useState } from "react";
import { SettingsRow } from "@/components/settings/settings-row";
import { SelectSheet, type SelectOption } from "@/components/settings/select-sheet";
import { useSettingsStore } from "@/lib/store/settings-store";
import type { PreferencesSettings } from "@/lib/settings/types";

const FIELDS: { key: keyof PreferencesSettings; label: string; options: SelectOption[] }[] = [
  { key: "defaultLandingPage", label: "Default Landing Page", options: ["Dashboard", "Matches", "Tournaments", "Analytics"] },
  { key: "dateFormat", label: "Date Format", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
  { key: "timeFormat", label: "Time Format", options: ["24-hour", "12-hour"] },
  { key: "timeZone", label: "Time Zone", options: ["GMT+10", "GMT+5:30", "GMT+0", "GMT-5"] },
  { key: "language", label: "Language", options: ["English", "Hindi", "Spanish", "French"] },
  { key: "measurementUnits", label: "Measurement Units", options: ["Metric", "Imperial"] },
  { key: "defaultTournamentFormat", label: "Default Tournament Format", options: ["T10", "T20", "ODI", "Test"] },
  { key: "defaultOvers", label: "Default Overs", options: ["10", "20", "50"] },
  { key: "defaultTeamSorting", label: "Default Team Sorting", options: ["Points", "Wins", "NRR", "Alphabetical"] },
];

export function PreferencesSection() {
  const { preferences, updatePreferences } = useSettingsStore();
  const [active, setActive] = useState<(typeof FIELDS)[number] | null>(null);

  return (
    <div className="flex flex-col divide-y divide-border">
      {FIELDS.map((field) => (
        <SettingsRow key={field.key} label={field.label} value={preferences[field.key]} onClick={() => setActive(field)} />
      ))}

      <SelectSheet
        title={active?.label ?? ""}
        open={active !== null}
        onOpenChange={(o) => !o && setActive(null)}
        options={active?.options ?? []}
        value={active ? preferences[active.key] : ""}
        onSelect={(value) => {
          if (!active) return;
          updatePreferences({ [active.key]: value }, `${active.label} → ${value}`);
          setActive(null);
        }}
      />
    </div>
  );
}
