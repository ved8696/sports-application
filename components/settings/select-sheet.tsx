"use client";

import { Check } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

export type SelectOption = string;

// Generic single-select bottom sheet backing every "label ... value ▾" row
// across Preferences, Cricket Preferences, and App Configuration -- reused
// rather than one bespoke picker per field.
export function SelectSheet({
  title,
  open,
  onOpenChange,
  options,
  value,
  onSelect,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      <div className="flex flex-col gap-2 pb-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={
              "flex items-center justify-between rounded-[10px] border p-3 text-left text-[12px] font-semibold " +
              (option === value ? "border-2 border-foreground" : "border-border")
            }
          >
            {option}
            {option === value && <Check size={15} className="text-foreground" />}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
