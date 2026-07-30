"use client";

// Mobile adaptation of the desktop app's components/dashboard/filter-bar.tsx.
// Same FilterState/FilterOptions model and setFilter/resetFilters actions
// (lib/cricket/filters.ts, reused unchanged) and the same dimension list and
// phase-chip logic -- only the controls changed: Radix <Select> dropdowns
// inline in a flex-wrap row (works on a wide desktop viewport, not a 480px
// phone) become a single "Filters" button that opens a bottom sheet of
// native <select> elements, per "Desktop Dialogs -> Bottom Sheets".
import { useMemo, useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL, type FilterOptions, type FilterState, type OversPhase } from "@/lib/cricket/filters";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const PHASE_CHIPS: OversPhase[] = ["All Overs", "Powerplay", "Middle Overs", "Death Overs"];

const SELECT_CLASS =
  "h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13.5px] text-foreground focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40";

export interface FilterBarProps {
  options: FilterOptions;
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

export function FilterBar({ options, filters, setFilter, resetFilters }: FilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const dimensions = useMemo(() => {
    const all: { key: keyof FilterState; label: string; options: string[] }[] = [
      { key: "tournament", label: "Tournament", options: options.tournaments },
      { key: "season", label: "Season", options: options.seasons },
      { key: "format", label: "Format", options: options.formats },
      { key: "venue", label: "Venue", options: options.venues },
      { key: "team", label: "Team", options: options.teams },
      { key: "opponent", label: "Opponent", options: options.teams },
      { key: "player", label: "Player", options: options.players },
      { key: "bowler", label: "Bowler", options: options.bowlers },
      { key: "year", label: "Year", options: options.years },
      { key: "result", label: "Result", options: options.results },
    ];
    if (options.hasBattingHandData) all.push({ key: "battingHand", label: "Batting Hand", options: options.battingHands });
    if (options.hasBowlingStyleData) all.push({ key: "bowlingStyle", label: "Bowling Style", options: options.bowlingStyles });
    return all.filter((d) => d.options.length > 0);
  }, [options]);

  const activeCount = dimensions.filter((d) => (filters[d.key] as string) !== ALL).length;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="md" onClick={() => setSheetOpen(true)} className="flex-1 justify-start gap-2">
          <SlidersHorizontal size={15} />
          Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
        </Button>
        <Button variant="ghost" size="icon" onClick={resetFilters} aria-label="Reset filters">
          <RotateCcw size={15} />
        </Button>
      </div>

      {options.hasPhaseData && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {PHASE_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setFilter("phase", chip)}
              className={cn(
                "flex-none rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.phase === chip ? "border-blue/50 bg-blue/15 text-blue" : "border-border bg-surface text-muted"
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Filters">
        <div className="flex flex-col gap-4 pb-4">
          {dimensions.map((d) => (
            <div key={d.key}>
              <label className="mb-1.5 block text-xs font-semibold text-muted">{d.label}</label>
              <select value={filters[d.key] as string} onChange={(e) => setFilter(d.key, e.target.value)} className={SELECT_CLASS}>
                <option value={ALL}>All {d.label}s</option>
                {d.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {options.maxOver > 1 && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">Overs</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={options.maxOver}
                  value={filters.overFrom}
                  onChange={(e) => setFilter("overFrom", clamp(Number(e.target.value) || 1, 1, options.maxOver))}
                  className="h-11"
                  aria-label="From over"
                />
                <span className="text-xs text-muted-2">to</span>
                <Input
                  type="number"
                  min={1}
                  max={options.maxOver}
                  placeholder={String(options.maxOver)}
                  value={filters.overTo ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setFilter("overTo", raw === "" ? null : clamp(Number(raw), 1, options.maxOver));
                  }}
                  className="h-11"
                  aria-label="To over"
                />
              </div>
            </div>
          )}

          <Button variant="ghost" onClick={resetFilters} className="gap-1.5">
            <RotateCcw size={14} />
            Reset All Filters
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
