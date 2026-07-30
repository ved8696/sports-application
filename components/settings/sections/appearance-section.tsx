"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { ThemePickerSheet } from "@/components/settings/theme-picker-sheet";
import { SelectSheet } from "@/components/settings/select-sheet";
import { useSettingsStore } from "@/lib/store/settings-store";
import type { AccentColor, DisplayDensity, FontSize } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

const THEME_LABEL: Record<string, string> = { light: "Light", dark: "Dark", system: "System" };
const ACCENT_SWATCH: Record<AccentColor, string> = { ink: "#1a1a1a", slate: "#6b6a67", wood: "var(--wood)" };
const ACCENT_LABEL: Record<AccentColor, string> = { ink: "Ink", slate: "Slate", wood: "Wood" };
const FONT_SIZES: FontSize[] = ["small", "medium", "large"];
const DENSITIES: DisplayDensity[] = ["compact", "comfortable", "spacious"];

function SegmentGroup<T extends string>({ options, value, onChange, labels }: { options: T[]; value: T; onChange: (v: T) => void; labels: Record<T, string> }) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "flex-1 rounded-[10px] border py-2 text-center text-[10.5px] font-semibold capitalize",
            opt === value ? "border-2 border-foreground font-bold" : "border-border text-muted"
          )}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

export function AppearanceSection() {
  const { appearance, updateAppearance } = useSettingsStore();
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [accentSheetOpen, setAccentSheetOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <p className="pb-1.5 pt-0 text-[10px] font-bold uppercase tracking-wide text-muted-2">Theme</p>
      <button type="button" onClick={() => setThemeSheetOpen(true)} className="mb-3.5 flex gap-2">
        {(["light", "dark", "system"] as const).map((t) => (
          <span
            key={t}
            className={cn(
              "flex-1 rounded-[10px] border py-2.5 text-center text-[11px] font-semibold",
              t === appearance.theme ? "border-2 border-foreground font-bold" : "border-border"
            )}
          >
            {THEME_LABEL[t]}
          </span>
        ))}
      </button>

      <button type="button" onClick={() => setAccentSheetOpen(true)} className="flex items-center justify-between border-b border-border pb-3 mb-3">
        <span className="text-[11px] font-semibold">Accent Colour</span>
        <span className="flex items-center gap-1.5">
          {(["ink", "slate", "wood"] as AccentColor[]).map((c) => (
            <span
              key={c}
              className={cn("h-4 w-4 rounded-full", c === appearance.accentColor && "ring-2 ring-offset-1 ring-foreground")}
              style={{ background: ACCENT_SWATCH[c] }}
            />
          ))}
          <span className="text-muted-2">›</span>
        </span>
      </button>

      <div className="mb-3.5">
        <p className="mb-2 text-[11px] font-semibold">Font Size</p>
        <SegmentGroup
          options={FONT_SIZES}
          value={appearance.fontSize}
          onChange={(v) => updateAppearance({ fontSize: v }, `Font Size → ${v}`)}
          labels={{ small: "Small", medium: "Medium", large: "Large" }}
        />
      </div>

      <div className="mb-3.5">
        <p className="mb-2 text-[11px] font-semibold">Display Density</p>
        <SegmentGroup
          options={DENSITIES}
          value={appearance.density}
          onChange={(v) => updateAppearance({ density: v }, `Display Density → ${v}`)}
          labels={{ compact: "Compact", comfortable: "Comfortable", spacious: "Spacious" }}
        />
      </div>

      <ToggleSwitch
        label="Reduce Animations"
        checked={appearance.reduceAnimations}
        onChange={(v) => updateAppearance({ reduceAnimations: v }, `Reduce Animations → ${v ? "On" : "Off"}`)}
      />

      <ThemePickerSheet open={themeSheetOpen} onOpenChange={setThemeSheetOpen} />
      <SelectSheet
        title="Accent Colour"
        open={accentSheetOpen}
        onOpenChange={setAccentSheetOpen}
        options={Object.values(ACCENT_LABEL)}
        value={ACCENT_LABEL[appearance.accentColor]}
        onSelect={(label) => {
          const next = (Object.keys(ACCENT_LABEL) as AccentColor[]).find((key) => ACCENT_LABEL[key] === label);
          if (!next) return;
          updateAppearance({ accentColor: next }, `Accent Colour → ${label}`);
          setAccentSheetOpen(false);
        }}
      />
    </div>
  );
}
