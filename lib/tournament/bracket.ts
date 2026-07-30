// Round-robin scheduling (circle method) and single-elimination knockout
// pairing/advancement. Produces plain { round, teamA, teamB } pairings only --
// turning those into real, playable matches is always done through the
// existing Fixture creation path (useFixtureStore.createFixture), so every
// tournament match still goes through the same validation, storage, and
// match-lifecycle code every standalone match already uses.

import type { Fixture } from "@/lib/cricket/fixture-types";

export interface Pairing {
  round: string;
  teamA: string;
  teamB: string;
}

/** Standard circle method: fixes one team, rotates the rest -- N-1 rounds for even N, each team idle exactly one round for odd N (a "bye" pairing is dropped). */
export function generateRoundRobin(teams: string[]): Pairing[] {
  const list = [...teams];
  if (list.length % 2 !== 0) list.push("BYE");
  const n = list.length;
  const rounds = n - 1;
  const pairings: Pairing[] = [];

  const arr = [...list];
  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < n / 2; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home !== "BYE" && away !== "BYE") {
        pairings.push({ round: `Round ${round + 1}`, teamA: home, teamB: away });
      }
    }
    // Rotate every element except the first.
    arr.splice(1, 0, arr.pop()!);
  }
  return pairings;
}

const KNOCKOUT_ROUND_NAME: Record<number, string> = {
  2: "Final",
  4: "Semifinal",
  8: "Quarterfinal",
  16: "Round of 16",
  32: "Round of 32",
};

export function knockoutRoundName(teamsInRound: number): string {
  return KNOCKOUT_ROUND_NAME[teamsInRound] ?? `Round of ${teamsInRound}`;
}

/** First knockout round only -- later rounds are generated on demand via advanceKnockoutRound once their feeder matches are complete. */
export function generateKnockoutFirstRound(teamsInSeedOrder: string[]): Pairing[] {
  const round = knockoutRoundName(teamsInSeedOrder.length);
  const pairings: Pairing[] = [];
  for (let i = 0; i < teamsInSeedOrder.length; i += 2) {
    if (teamsInSeedOrder[i + 1]) pairings.push({ round, teamA: teamsInSeedOrder[i], teamB: teamsInSeedOrder[i + 1] });
  }
  return pairings;
}

export const KNOCKOUT_ROUND_ORDER = ["Quarterfinal", "Semifinal", "Final"];

/** True once every fixture in a given knockout round has a result -- the gate for surfacing "Advance to next round". */
export function isRoundComplete(fixtures: Fixture[], round: string): boolean {
  const inRound = fixtures.filter((f) => f.round === round);
  return inRound.length > 0 && inRound.every((f) => f.status === "Completed");
}

/** Pairs the winners of a completed round in bracket order (1v2, 3v4, ...) into the next round's fixtures. Winners are supplied by the caller (read from the archived Match result), keyed by fixture id, so this module stays free of any dependency on the historical-match data shape. */
export function advanceKnockoutRound(fixtures: Fixture[], round: string, winnerByFixtureId: Record<string, string>): Pairing[] {
  const inRound = fixtures.filter((f) => f.round === round).sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  const winners = inRound.map((f) => winnerByFixtureId[f.id]).filter((w): w is string => Boolean(w));
  if (winners.length !== inRound.length || winners.length < 2) return [];
  const nextRound = knockoutRoundName(winners.length);
  const pairings: Pairing[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    if (winners[i + 1]) pairings.push({ round: nextRound, teamA: winners[i], teamB: winners[i + 1] });
  }
  return pairings;
}
