"use client";

import { cn } from "@/lib/utils";

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className={cn("text-[13px] font-semibold", disabled && "text-muted")}>{label}</p>
        {description && <p className="mt-0.5 text-[11.5px] text-muted-2">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 flex-none rounded-full border transition-colors disabled:opacity-40",
          checked ? "border-blue/60 bg-blue/70" : "border-border bg-surface-3"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
