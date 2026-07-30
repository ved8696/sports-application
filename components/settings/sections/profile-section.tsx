"use client";

import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsRow } from "@/components/settings/settings-row";
import { useSettingsStore } from "@/lib/store/settings-store";
import { PROFILE_FIELD_LABEL, type ProfileFieldKey } from "@/lib/settings/types";

const FIELD_ORDER: ProfileFieldKey[] = [
  "name",
  "username",
  "email",
  "mobileNumber",
  "dateOfBirth",
  "country",
  "language",
  "bio",
  "organisation",
];

function displayValue(key: ProfileFieldKey, value: string): string {
  if (key === "bio") return value.length > 18 ? `${value.slice(0, 18)}…` : value;
  if (key === "username") return `@${value}`;
  if (key === "dateOfBirth" && value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  return value;
}

// Mobile: chevron list navigating into the generic Edit Field screen per
// field. Tablet gets its own grid-of-inputs variant (profile-edit-grid.tsx)
// per the wireframe's tablet-selected screen -- deliberately not reused
// here since it's a genuinely different interaction, not just a reflow.
export function ProfileSection() {
  const router = useRouter();
  const { profile, updateProfile } = useSettingsStore();

  function changePhoto() {
    updateProfile({}, "Profile photo updated");
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-2 border-b border-border py-4">
        <button type="button" onClick={changePhoto} className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-3">
          <Camera size={20} className="text-muted" />
        </button>
        <button type="button" onClick={changePhoto} className="text-[11px] font-bold text-foreground">
          Change Photo
        </button>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {FIELD_ORDER.map((key) => (
          <SettingsRow
            key={key}
            label={PROFILE_FIELD_LABEL[key]}
            value={displayValue(key, profile[key])}
            href={`/settings/profile/${key}`}
          />
        ))}
      </div>

      <div className="pt-5">
        <Button onClick={() => router.push("/settings")}>Save Changes</Button>
      </div>
    </div>
  );
}
