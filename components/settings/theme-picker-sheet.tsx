"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/store/settings-store";
import type { ThemePreference } from "@/lib/settings/types";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System default" },
];

export function ThemePickerSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { appearance, updateAppearance } = useSettingsStore();
  const [pending, setPending] = useState<ThemePreference>(appearance.theme);

  function handleApply() {
    updateAppearance({ theme: pending }, `Theme → ${OPTIONS.find((o) => o.value === pending)?.label}`);
    onOpenChange(false);
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={(o) => {
        if (o) setPending(appearance.theme);
        onOpenChange(o);
      }}
      title="Choose Theme"
    >
      <div className="flex flex-col gap-3.5 pb-2">
        <div className="flex flex-col gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPending(opt.value)}
              className={
                "flex items-center justify-between rounded-[10px] border p-3 text-left text-[12px] font-semibold " +
                (pending === opt.value ? "border-2 border-foreground" : "border-border")
              }
            >
              {opt.label}
              <span
                className={
                  "h-4 w-4 rounded-full border " + (pending === opt.value ? "border-foreground bg-foreground" : "border-border")
                }
              />
            </button>
          ))}
        </div>
        <Button onClick={handleApply}>Apply</Button>
      </div>
    </BottomSheet>
  );
}
