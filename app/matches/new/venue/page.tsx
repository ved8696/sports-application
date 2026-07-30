"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { WizardShell } from "@/components/mobile/wizard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { OptionCard } from "@/components/match-creation/option-card";
import { FieldLabel, FieldError } from "@/components/match-creation/form-field";
import { useCricketStore } from "@/lib/store/cricket-store";
import { useMatchCreationStore } from "@/lib/store/match-creation-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { matchesSearch } from "@/lib/cricket/helpers";
import { guardRedirect, validateVenueStep } from "@/lib/matchCreation/validation";
import { WIZARD_STEPS, STEP_TITLE } from "@/lib/matchCreation/types";

interface VenueOption {
  name: string;
  city?: string;
}

function venueOptions(matches: { venue: { name: string; city?: string } }[]): VenueOption[] {
  const map = new Map<string, string | undefined>();
  for (const m of matches) {
    if (m.venue.name && !map.has(m.venue.name)) map.set(m.venue.name, m.venue.city);
  }
  return Array.from(map.entries())
    .map(([name, city]) => ({ name, city }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function VenueStep() {
  const router = useRouter();
  const { matches, status, load } = useCricketStore();
  const { draft, updateDraft } = useMatchCreationStore();
  const hasHydrated = useHasHydrated(useMatchCreationStore.persist);
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newNameError, setNewNameError] = useState<string | undefined>();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!hasHydrated) return;
    const redirect = guardRedirect(draft, "venue");
    if (redirect) router.replace(redirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  const venues = useMemo(() => venueOptions(matches), [matches]);
  const filtered = useMemo(
    () => venues.filter((v) => matchesSearch([v.name, v.city], search)),
    [venues, search]
  );

  const errors = validateVenueStep(draft);

  function selectVenue(venue: VenueOption) {
    updateDraft({ venue: { name: venue.name, city: venue.city ?? "" } });
  }

  function saveNewVenue() {
    if (!newName.trim()) {
      setNewNameError("Venue name is required.");
      return;
    }
    updateDraft({ venue: { name: newName.trim(), city: newCity.trim() } });
    setSheetOpen(false);
    setNewName("");
    setNewCity("");
    setNewNameError(undefined);
  }

  function handleNext() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    router.push("/matches/new/schedule");
  }

  return (
    <WizardShell
      title={STEP_TITLE.venue}
      stepIndex={WIZARD_STEPS.indexOf("venue")}
      stepCount={WIZARD_STEPS.length}
      backHref="/matches/new/rules"
      footer={<Button onClick={handleNext}>Continue</Button>}
    >
      <div className="flex flex-col gap-4 pt-1">
        {draft.venue.name && (
          <div className="rounded-xl border border-blue/50 bg-blue/[0.06] px-4 py-3.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-2">Selected venue</p>
            <p className="mt-0.5 text-[14px] font-bold">{draft.venue.name}</p>
            {draft.venue.city && <p className="text-[11.5px] text-muted-2">{draft.venue.city}</p>}
          </div>
        )}

        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venues…"
            className="pl-10"
          />
        </div>

        <Button variant="outline" size="md" onClick={() => setSheetOpen(true)} className="justify-start gap-2.5">
          <Plus size={16} />
          Add New Venue
        </Button>

        <div className="flex flex-col gap-2">
          {status !== "ready" ? (
            <p className="py-6 text-center text-xs text-muted">Loading venues…</p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">No venues match your search.</p>
          ) : (
            filtered.map((v) => (
              <OptionCard
                key={v.name}
                title={v.name}
                subtitle={v.city && !v.name.toLowerCase().includes(v.city.toLowerCase()) ? v.city : undefined}
                selected={draft.venue.name === v.name}
                onClick={() => selectVenue(v)}
              />
            ))
          )}
        </div>
        {touched && <FieldError>{errors.name}</FieldError>}
      </div>

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Add New Venue">
        <div className="flex flex-col gap-4 pb-2">
          <div>
            <FieldLabel htmlFor="new-venue-name">Venue Name</FieldLabel>
            <Input
              id="new-venue-name"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (newNameError) setNewNameError(undefined);
              }}
              placeholder="e.g. Riverside Ground"
              error={newNameError}
            />
            <FieldError>{newNameError}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="new-venue-city">City</FieldLabel>
            <Input
              id="new-venue-city"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="e.g. Colombo"
            />
          </div>
          <Button onClick={saveNewVenue}>Save Venue</Button>
        </div>
      </BottomSheet>
    </WizardShell>
  );
}
