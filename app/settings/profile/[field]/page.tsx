"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader, ScreenBody } from "@/components/mobile/app-screen";
import { useSettingsStore } from "@/lib/store/settings-store";
import { PROFILE_FIELD_LABEL, PROFILE_FIELD_MAX_LENGTH, type ProfileFieldKey } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

const FIELD_TYPE: Partial<Record<ProfileFieldKey, "textarea" | "email" | "tel" | "date">> = {
  bio: "textarea",
  email: "email",
  mobileNumber: "tel",
  dateOfBirth: "date",
};

function isValidField(field: string): field is ProfileFieldKey {
  return field in PROFILE_FIELD_LABEL;
}

// Generic edit screen for every Profile field -- the wireframe explicitly
// designs one representative "Edit Bio" screen and reuses the same pattern
// for the rest rather than a bespoke screen per field.
export default function EditProfileFieldPage() {
  const params = useParams();
  const router = useRouter();
  const fieldParam = (Array.isArray(params.field) ? params.field[0] : params.field) as string;
  const { profile, updateProfile } = useSettingsStore();

  const valid = isValidField(fieldParam);
  const [value, setValue] = useState(valid ? profile[fieldParam] : "");

  if (!valid) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <ScreenHeader backHref="/settings/profile" title="Profile" />
        <ScreenBody className="flex flex-col justify-center">
          <EmptyState
            icon={SearchX}
            title="Unknown field"
            description="This profile field may have been removed, or the link is incorrect."
            action={
              <Button size="sm" asChild>
                <Link href="/settings/profile">Back to Profile</Link>
              </Button>
            }
          />
        </ScreenBody>
      </div>
    );
  }

  const label = PROFILE_FIELD_LABEL[fieldParam];
  const maxLength = PROFILE_FIELD_MAX_LENGTH[fieldParam];
  const type = FIELD_TYPE[fieldParam] ?? "text";
  const dirty = value !== profile[fieldParam];

  function handleSave() {
    updateProfile({ [fieldParam]: value } as Partial<typeof profile>, `${label} updated`);
    router.push("/settings/profile");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader
        backHref="/settings/profile"
        title={`Edit ${label}`}
        trailing={
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty}
            className={cn("text-[13px] font-bold", dirty ? "text-blue" : "text-muted-2")}
          >
            Save
          </button>
        }
      />

      <ScreenBody>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-2">{label}</p>
        {type === "textarea" ? (
          <>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
              rows={5}
              className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] text-foreground focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40"
            />
            {maxLength && (
              <p className="mt-1 text-right text-[10px] text-muted-2">
                {value.length} / {maxLength}
              </p>
            )}
          </>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13px] text-foreground focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40"
          />
        )}
      </ScreenBody>
    </div>
  );
}
