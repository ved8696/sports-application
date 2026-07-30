"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SelectSheet } from "@/components/settings/select-sheet";
import { SettingsRow, SettingsSectionLabel } from "@/components/settings/settings-row";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useCricketStore } from "@/lib/store/cricket-store";
import { extractFilterOptions } from "@/lib/cricket/filters";
import { CRICKET_FORMATS, type CricketFormat, type CricketPreferences } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

function ChipList({
  items,
  onRemove,
  onAddClick,
}: {
  items: string[];
  onRemove: (item: string) => void;
  onAddClick: () => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {items.map((item) => (
        <span key={item} className="flex flex-none items-center gap-1.5 rounded-xl border border-border px-2.5 py-1 text-[10px] font-semibold">
          {item}
          <button type="button" onClick={() => onRemove(item)} aria-label={`Remove ${item}`}>
            <X size={11} className="text-muted-2" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onAddClick}
        className="flex-none rounded-xl border border-dashed border-border px-2.5 py-1 text-[10px] font-semibold text-muted"
      >
        + Add
      </button>
    </div>
  );
}

type AddTarget = "favouriteTeams" | "favouritePlayers" | "favouriteTournaments" | null;

export function CricketPreferencesSection() {
  const { cricket, updateCricket } = useSettingsStore();
  const { matches, load } = useCricketStore();
  const [addTarget, setAddTarget] = useState<AddTarget>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [scoringSheetOpen, setScoringSheetOpen] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const options = useMemo(() => extractFilterOptions(matches, {}), [matches]);

  function toggleFormat(format: CricketFormat) {
    const set = new Set(cricket.preferredFormats);
    if (set.has(format)) set.delete(format);
    else set.add(format);
    const next = Array.from(set);
    updateCricket({ preferredFormats: next }, `Preferred Formats → ${next.join(", ") || "None"}`);
  }

  function removeFromList(key: Exclude<AddTarget, null>, value: string) {
    const next = cricket[key].filter((v) => v !== value);
    updateCricket({ [key]: next } as Partial<CricketPreferences>, `${labelFor(key)} updated`);
  }

  function addToList(key: Exclude<AddTarget, null>, value: string) {
    const trimmed = value.trim();
    if (!trimmed || cricket[key].includes(trimmed)) return;
    updateCricket({ [key]: [...cricket[key], trimmed] } as Partial<CricketPreferences>, `${labelFor(key)} updated`);
  }

  function labelFor(key: Exclude<AddTarget, null>) {
    return key === "favouriteTeams" ? "Favourite Teams" : key === "favouritePlayers" ? "Favourite Players" : "Favourite Tournaments";
  }

  const pickerOptions =
    addTarget === "favouriteTeams"
      ? options.teams.filter((t) => !cricket.favouriteTeams.includes(t))
      : addTarget === "favouriteTournaments"
        ? options.tournaments.filter((t) => !cricket.favouriteTournaments.includes(t))
        : [];

  return (
    <div className="flex flex-col">
      <SettingsSectionLabel>Preferred Formats</SettingsSectionLabel>
      <div className="mb-1 flex gap-1.5">
        {CRICKET_FORMATS.map((format) => {
          const active = cricket.preferredFormats.includes(format);
          return (
            <button
              key={format}
              type="button"
              onClick={() => toggleFormat(format)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-[11px] font-semibold",
                active ? "bg-foreground text-background" : "border border-border text-muted"
              )}
            >
              {format}
            </button>
          );
        })}
      </div>

      <SettingsSectionLabel>Favourite Teams</SettingsSectionLabel>
      <ChipList items={cricket.favouriteTeams} onRemove={(v) => removeFromList("favouriteTeams", v)} onAddClick={() => setAddTarget("favouriteTeams")} />

      <SettingsSectionLabel>Favourite Players</SettingsSectionLabel>
      <ChipList items={cricket.favouritePlayers} onRemove={(v) => removeFromList("favouritePlayers", v)} onAddClick={() => setAddTarget("favouritePlayers")} />

      <SettingsSectionLabel>Favourite Tournaments</SettingsSectionLabel>
      <ChipList
        items={cricket.favouriteTournaments}
        onRemove={(v) => removeFromList("favouriteTournaments", v)}
        onAddClick={() => setAddTarget("favouriteTournaments")}
      />

      <div className="mt-1">
        <SettingsRow label="Default Scoring Preference" value={cricket.defaultScoringPreference} onClick={() => setScoringSheetOpen(true)} />
      </div>

      <SettingsSectionLabel>Preferred Statistics</SettingsSectionLabel>
      <div className="flex flex-col gap-2 pb-2">
        {(
          [
            ["battingAverage", "Batting Average"],
            ["strikeRate", "Strike Rate"],
            ["economyRate", "Economy Rate"],
          ] as const
        ).map(([key, label]) => {
          const checked = cricket.preferredStats[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                updateCricket(
                  { preferredStats: { ...cricket.preferredStats, [key]: !checked } },
                  `${label} ${!checked ? "shown" : "hidden"}`
                )
              }
              className="flex items-center gap-2 text-[11px] font-semibold"
            >
              <span className={cn("flex h-4 w-4 items-center justify-center rounded-[4px]", checked ? "bg-foreground text-background" : "border border-border")}>
                {checked && <Check size={11} />}
              </span>
              <span className={checked ? "text-foreground" : "text-muted-2"}>{label}</span>
            </button>
          );
        })}
      </div>

      {(addTarget === "favouriteTeams" || addTarget === "favouriteTournaments") && (
        <SelectSheet
          title={`Add ${labelFor(addTarget)}`}
          open
          onOpenChange={(o) => !o && setAddTarget(null)}
          options={pickerOptions}
          value=""
          onSelect={(v) => {
            addToList(addTarget, v);
            setAddTarget(null);
          }}
        />
      )}

      <BottomSheet open={addTarget === "favouritePlayers"} onOpenChange={(o) => !o && setAddTarget(null)} title="Add Favourite Player">
        <div className="flex flex-col gap-3 pb-2">
          <Input value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="Player name" />
          <Button
            onClick={() => {
              addToList("favouritePlayers", newPlayerName);
              setNewPlayerName("");
              setAddTarget(null);
            }}
            disabled={!newPlayerName.trim()}
          >
            <Plus size={15} /> Add Player
          </Button>
        </div>
      </BottomSheet>

      <SelectSheet
        title="Default Scoring Preference"
        open={scoringSheetOpen}
        onOpenChange={setScoringSheetOpen}
        options={["Ball-by-ball", "Over-by-over", "Quick totals only"]}
        value={cricket.defaultScoringPreference}
        onSelect={(v) => {
          updateCricket({ defaultScoringPreference: v }, `Default Scoring Preference → ${v}`);
          setScoringSheetOpen(false);
        }}
      />
    </div>
  );
}
