"use client";

import { cn } from "@/lib/utils";

export interface TabOption<T extends string> {
  value: T;
  label: string;
}

// Underline tab strip -- the design's recurring pattern (Tournament Details,
// Fixtures view-switch, Live/Completed Match, Analytics) was previously
// hand-rolled per screen; pulled out once it needed a fourth home.
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  scrollable = true,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  scrollable?: boolean;
}) {
  return (
    <div className={cn("flex gap-3.5 border-b border-border px-5", scrollable && "overflow-x-auto")}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-none whitespace-nowrap border-b-2 py-2.5 text-[12px] font-bold transition-colors",
            value === opt.value ? "border-foreground text-foreground" : "border-transparent text-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Pill-style view switch (Fixtures: List/Calendar/Round/Knockout) -- visually
// distinct from the underline Tabs above, matching the wireframe's own
// distinction between the two patterns.
export function PillTabs<T extends string>({ options, value, onChange }: { options: TabOption<T>[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto px-5 py-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-none rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors",
            value === opt.value ? "bg-foreground text-background" : "border border-border text-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
