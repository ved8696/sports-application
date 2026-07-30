"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldError } from "@/components/match-creation/form-field";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { tournamentRulesToFixtureRules, type Tournament } from "@/lib/tournament/types";

const SELECT_CLASS =
  "h-[38px] w-full rounded-xl border border-border bg-surface px-3 text-[12px] text-foreground focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40";

export function CreateMatchSheet({ tournament, open, onOpenChange }: { tournament: Tournament; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { createFixture } = useFixtureStore();
  const teamNames = tournament.teams.map((t) => t.name);
  const [teamA, setTeamA] = useState(teamNames[0] ?? "");
  const [teamB, setTeamB] = useState(teamNames[1] ?? teamNames[0] ?? "");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState(tournament.startDate);
  const [time, setTime] = useState("14:00");
  const [round, setRound] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    setError(null);
    if (teamA === teamB) {
      setError("Team A and Team B must be different.");
      return;
    }
    if (!venue.trim()) {
      setError("Venue is required.");
      return;
    }
    setSubmitting(true);
    try {
      const a = tournament.teams.find((t) => t.name === teamA);
      const b = tournament.teams.find((t) => t.name === teamB);
      await createFixture({
        name: `${teamA} vs ${teamB}`,
        tournament: { type: "tournament", name: tournament.name },
        tournamentId: tournament.id,
        round: round.trim() || undefined,
        format: "Custom",
        overs: tournament.rules.oversPerInnings,
        ballType: "Red",
        gender: "male",
        ageGroup: "Open",
        matchType: round.trim() || "League Stage",
        venue: { name: venue.trim() },
        date,
        startTime: time,
        timeZone: "UTC",
        dayNight: "Day",
        rules: tournamentRulesToFixtureRules(tournament.rules),
        teams: [
          { name: teamA, squad: a?.squad ?? [] },
          { name: teamB, squad: b?.squad ?? [] },
        ],
      });
      onOpenChange(false);
      setVenue("");
      setRound("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create match.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="New Match">
      <div className="flex flex-col gap-2.5 pb-2">
        <div>
          <FieldLabel htmlFor="team-a">Team A</FieldLabel>
          <select id="team-a" className={SELECT_CLASS} value={teamA} onChange={(e) => setTeamA(e.target.value)}>
            {teamNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="team-b">Team B</FieldLabel>
          <select id="team-b" className={SELECT_CLASS} value={teamB} onChange={(e) => setTeamB(e.target.value)}>
            {teamNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="venue">Venue</FieldLabel>
          <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Central Ground" />
        </div>
        <div>
          <FieldLabel htmlFor="round">Round / Stage (optional)</FieldLabel>
          <Input id="round" value={round} onChange={(e) => setRound(e.target.value)} placeholder="Round 5" />
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1">
            <FieldLabel htmlFor="match-date">Date</FieldLabel>
            <Input id="match-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <FieldLabel htmlFor="match-time">Time</FieldLabel>
            <Input id="match-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        {error && <FieldError>{error}</FieldError>}
        <Button onClick={handleCreate} disabled={submitting} className="mt-1">
          {submitting ? "Creating…" : "Create Match"}
        </Button>
      </div>
    </BottomSheet>
  );
}
