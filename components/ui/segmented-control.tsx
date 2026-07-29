"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-11 min-w-[72px] flex-1 rounded-xl border px-3 text-[13px] font-semibold transition-colors active:scale-[0.98]",
            value === opt.value ? "border-blue/60 bg-blue/15 text-blue" : "border-border bg-surface text-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
