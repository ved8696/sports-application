"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// Selectable card row -- the mobile replacement for a desktop table row,
// reused for both the Tournament Selection and Venue lists.
export function OptionCard({
  title,
  subtitle,
  selected,
  onClick,
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left transition-transform active:scale-[0.98]">
      <Card className={cn("flex items-center justify-between gap-3 p-3.5", selected && "border-blue/50 bg-blue/[0.06]")}>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-bold">{title}</p>
          {subtitle && <p className="truncate text-[11px] text-muted-2">{subtitle}</p>}
        </div>
        {selected && <Check size={16} className="flex-none text-blue" />}
      </Card>
    </button>
  );
}
