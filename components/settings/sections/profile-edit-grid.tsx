"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/match-creation/form-field";
import { useSettingsStore } from "@/lib/store/settings-store";
import type { ProfileFields } from "@/lib/settings/types";

const GRID_FIELDS: (keyof ProfileFields)[] = ["name", "username", "email", "mobileNumber", "country", "language"];

// Tablet-only: the design shows Profile's detail pane as a direct 2-column
// grid of editable inputs with Save/Discard, not the mobile chevron list --
// a genuinely different interaction (inline edit vs. drill-in), not a CSS
// reflow of the same component.
export function ProfileEditGrid() {
  const { profile, updateProfile } = useSettingsStore();
  const [draft, setDraft] = useState(profile);

  const dirty = GRID_FIELDS.some((key) => draft[key] !== profile[key]);

  function handleSave() {
    updateProfile(draft, "Profile updated");
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        {GRID_FIELDS.map((key) => (
          <div key={key}>
            <FieldLabel htmlFor={`tablet-${key}`}>{key === "mobileNumber" ? "Mobile Number" : key.charAt(0).toUpperCase() + key.slice(1)}</FieldLabel>
            <Input id={`tablet-${key}`} value={draft[key]} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="outline" size="md" onClick={() => setDraft(profile)} disabled={!dirty}>
          Discard
        </Button>
        <Button size="md" onClick={handleSave} disabled={!dirty}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
