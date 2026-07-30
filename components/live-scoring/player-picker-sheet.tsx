"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Card } from "@/components/ui/card";

// Generic name-list picker reused for opener selection, new-batter,
// new-bowler, and fielder pickers -- every Playing XI is small (11 players)
// so a plain scrollable list needs no search, unlike Sprint 2/3's pickers.
export function PlayerPickerSheet({
  open,
  onOpenChange,
  title,
  players,
  disabledNames = [],
  onSelect,
  dismissible = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  players: string[];
  disabledNames?: string[];
  onSelect: (name: string) => void;
  dismissible?: boolean;
}) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title} dismissible={dismissible}>
      <div className="flex flex-col gap-2 pb-4">
        {players.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">No players available.</p>
        ) : (
          players.map((name) => {
            const disabled = disabledNames.includes(name);
            return (
              <button
                key={name}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(name)}
                className="w-full text-left transition-transform active:scale-[0.98] disabled:opacity-40"
              >
                <Card className="p-3.5">
                  <p className="text-[13.5px] font-semibold">{name}</p>
                </Card>
              </button>
            );
          })
        )}
      </div>
    </BottomSheet>
  );
}
