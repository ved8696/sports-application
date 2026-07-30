// Builds the initial LiveMatchState from a completed Fixture (from Sprint 3's
// pre-match setup) plus the openers chosen right before the first ball.
// Reuses Fixture.teams/toss/rules/venue directly -- nothing here is
// fabricated, and no new team/player model is introduced.

import type { Fixture } from "@/lib/cricket/fixture-types";
import type { InningsState, LiveMatchState } from "./types";
import { createBatter } from "./batters";
import { createBowler } from "./bowlers";
import { newPartnership } from "./partnerships";

export interface OpeningSelection {
  strikerName: string;
  nonStrikerName: string;
  bowlerName: string;
}

function emptyExtrasTotal(): InningsState["extrasTotal"] {
  return { wide: 0, "no-ball": 0, bye: 0, "leg-bye": 0, penalty: 0 };
}

export function createInnings(
  inningsNumber: 1 | 2,
  battingTeam: string,
  bowlingTeam: string,
  openers: OpeningSelection
): InningsState {
  return {
    inningsNumber,
    battingTeam,
    bowlingTeam,
    status: "in-progress",
    totalRuns: 0,
    totalWickets: 0,
    legalBalls: 0,
    extrasTotal: emptyExtrasTotal(),
    strikerName: openers.strikerName,
    nonStrikerName: openers.nonStrikerName,
    currentBowlerName: openers.bowlerName,
    previousOverBowlerName: null,
    isFreeHit: false,
    currentOverEvents: [],
    completedOvers: [],
    events: [],
    batters: {
      [openers.strikerName]: createBatter(openers.strikerName, 1),
      [openers.nonStrikerName]: createBatter(openers.nonStrikerName, 2),
    },
    battingOrder: [openers.strikerName, openers.nonStrikerName],
    bowlers: { [openers.bowlerName]: createBowler(openers.bowlerName) },
    fallOfWickets: [],
    partnerships: [newPartnership(openers.strikerName, openers.nonStrikerName, "0.0")],
    endReason: null,
  };
}

/** Which team bats first, derived from the toss -- the same computation already used on the Match Ready screen. */
export function battingFirstTeam(fixture: Fixture): string {
  if (!fixture.teams || !fixture.toss) throw new Error("Fixture is missing teams/toss.");
  const [teamA, teamB] = fixture.teams;
  return fixture.toss.decision === "bat" ? fixture.toss.winner : fixture.toss.winner === teamA.name ? teamB.name : teamA.name;
}

export function bowlingFirstTeam(fixture: Fixture): string {
  if (!fixture.teams) throw new Error("Fixture is missing teams.");
  const [teamA, teamB] = fixture.teams;
  const battingFirst = battingFirstTeam(fixture);
  return battingFirst === teamA.name ? teamB.name : teamA.name;
}

export function createLiveMatchState(fixture: Fixture, openers: OpeningSelection): LiveMatchState {
  if (!fixture.teams || !fixture.toss) {
    throw new Error("Fixture is missing teams/toss -- complete pre-match setup first.");
  }
  const battingFirst = battingFirstTeam(fixture);
  const bowlingFirst = bowlingFirstTeam(fixture);

  return {
    fixtureId: fixture.id,
    status: "in-progress",
    currentInnings: 1,
    format: fixture.format,
    oversLimit: fixture.rules.oversPerInnings,
    rules: fixture.rules,
    venue: fixture.venue,
    ballType: fixture.ballType,
    gender: fixture.gender,
    dayNight: fixture.dayNight,
    innings1: createInnings(1, battingFirst, bowlingFirst, openers),
    innings2: null,
    result: null,
    report: null,
    potm: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
}
