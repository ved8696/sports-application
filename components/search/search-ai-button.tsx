"use client";

import { Search, Sparkle } from "lucide-react";
import { useSearchUiStore } from "@/lib/store/search-ui-store";
import { cn } from "@/lib/utils";

// Search + AI entry point for every primary screen's header. Deliberately a
// magnifying glass with a small sparkle accent rather than a chat-bubble --
// today it only opens literal search, but the icon is already the one an
// assistant entry point would use, so Phase 2 needs no icon/placement
// change, just a different panel body behind the same trigger.
export function SearchAiButton({ className }: { className?: string }) {
  const setOpen = useSearchUiStore((s) => s.setOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Search & AI"
      className={cn(
        "relative flex h-9 w-9 flex-none items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted",
        className
      )}
    >
      <Search size={16} />
      <Sparkle size={9} className="absolute right-1 top-1 fill-wood text-wood" strokeWidth={1.5} />
    </button>
  );
}
