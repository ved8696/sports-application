"use client";

import { Clock } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

// The wireframe pairs each Settings category with one representative
// detail/dialog screen rather than a fully designed destination for every
// single row (its own words: "a representative edit/detail screen and
// dialog per group rather than one screen per field"). Rows with no
// designed destination open this instead of doing nothing on tap --
// mirrors components/mobile/coming-soon.tsx's copy, as a sheet since these
// are secondary rows rather than primary navigation destinations.
export function ComingSoonSheet({ title, open, onOpenChange }: { title: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-wood/12 text-wood">
          <Clock size={20} />
        </div>
        <p className="text-sm font-bold">Coming in a future sprint</p>
        <p className="max-w-[240px] text-xs text-muted">This setting isn&apos;t wired up to real data yet.</p>
      </div>
    </BottomSheet>
  );
}
