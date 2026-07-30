"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-semibold">Unknown field</p>
        <Link href="/settings/profile" className="text-xs font-semibold text-blue">
          Back to Profile
        </Link>
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
      <header className="flex flex-none items-center gap-3 px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <Link href="/settings/profile" className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="flex-1 text-lg font-extrabold">Edit {label}</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className={cn("text-[13px] font-bold", dirty ? "text-blue" : "text-muted-2")}
        >
          Save
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5">
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
      </div>
    </div>
  );
}
