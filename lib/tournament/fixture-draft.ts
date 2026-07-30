// Turns a Tournament + a bracket.ts Pairing into a real FixtureDraft --
// exactly the shape app/api/fixtures/route.ts already accepts from the
// standalone /matches/new wizard. Tournament fixtures are never a separate
// write path; they're created one at a time through the same
// useFixtureStore().createFixture() every other match uses.

import type { FixtureDraft } from "@/lib/cricket/fixture-types";
import type { Pairing } from "./bracket";
import type { Tournament } from "./types";
import { tournamentRulesToFixtureRules } from "./types";

function teamSquad(tournament: Tournament, name: string): string[] {
  return tournament.teams.find((t) => t.name === name)?.squad ?? [];
}

export function buildFixtureDraftFromPairing(tournament: Tournament, pairing: Pairing, date: string, startTime: string): FixtureDraft {
  return {
    name: `${pairing.teamA} vs ${pairing.teamB}`,
    tournament: { type: "tournament", name: tournament.name },
    tournamentId: tournament.id,
    round: pairing.round,
    format: "Custom",
    overs: tournament.rules.oversPerInnings,
    ballType: "Red",
    gender: "male",
    ageGroup: "Open",
    matchType: pairing.round,
    venue: { name: "TBD" },
    date,
    startTime,
    timeZone: "UTC",
    dayNight: "Day",
    rules: tournamentRulesToFixtureRules(tournament.rules),
    teams: [
      { name: pairing.teamA, squad: teamSquad(tournament, pairing.teamA) },
      { name: pairing.teamB, squad: teamSquad(tournament, pairing.teamB) },
    ],
  };
}

/** Spaces generated fixtures across the tournament's date range, a few days apart per round, cycling a fixed match time. */
export function scheduleDatesForPairings(pairings: Pairing[], startDate: string): { date: string; startTime: string }[] {
  const rounds = Array.from(new Set(pairings.map((p) => p.round)));
  const start = new Date(`${startDate}T00:00:00`);
  return pairings.map((p) => {
    const roundIndex = rounds.indexOf(p.round);
    const d = new Date(start);
    d.setDate(d.getDate() + roundIndex * 3);
    return { date: d.toISOString().slice(0, 10), startTime: "14:00" };
  });
}
