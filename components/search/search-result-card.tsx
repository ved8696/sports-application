"use client";

import { ChevronRight, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSearchStore } from "@/lib/store/search-store";
import { SEARCH_CATEGORY_ICON, type SearchResultItem } from "@/lib/search/types";
import { cn } from "@/lib/utils";

export function SearchResultCard({ item, onNavigate }: { item: SearchResultItem; onNavigate: (item: SearchResultItem) => void }) {
  const { togglePinned, isPinned } = useSearchStore();
  const pinned = isPinned(item.id);
  const Icon = SEARCH_CATEGORY_ICON[item.category];

  return (
    <button type="button" onClick={() => onNavigate(item)} className="w-full text-left">
      <Card className="flex items-center gap-3 p-3">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-wood/12 text-wood">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">{item.title}</p>
          <p className="truncate text-[11px] text-muted-2">{item.subtitle}</p>
        </div>
        <span
          role="button"
          tabIndex={0}
          aria-label={pinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
          onClick={(e) => {
            e.stopPropagation();
            togglePinned(item);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              togglePinned(item);
            }
          }}
          className="flex h-7 w-7 flex-none items-center justify-center rounded-md"
        >
          <Star size={14} className={cn(pinned ? "fill-wood text-wood" : "text-muted-2")} />
        </span>
        <ChevronRight size={15} className="flex-none text-muted-2" />
      </Card>
    </button>
  );
}
