// Live-scoring domain model. Distinct from lib/cricket/types.ts's Match (a
// parsed, completed Cricsheet record) and lib/cricket/fixture-types.ts's
// Fixture (a scheduled-but-not-played match) -- this is the third and final
// tier: a match that is *currently being played*, ball by ball. It is keyed
// by Fixture.id and, once a match finishes (a future sprint), is intended to
// fold back down into the same normalized shape lib/cricket/types.ts already
// defines, so completed live matches join the historical dataset seamlessly.
//
// Every module under lib/liveScoring/ is a pure function operating on this
// state -- no React, no fetch, no fs -- so the same engine can eventually
// back broadcast graphics, AI analytics, or automated highlight generation
// without dragging UI or persistence concerns along with it.

import type { Gender } from "@/lib/cricket/types";
import type { BallType, DayNight, FixtureRules, FixtureVenue } from "@/lib/cricket/fixture-types";

export type ExtraType = "wide" | "no-ball" | "bye" | "leg-bye" | "penalty";

export type WicketType =
  | "bowled"
  | "caught"
  | "lbw"
  | "run-out"
  | "stumped"
  | "hit-wicket"
  | "retired-hurt"
  | "retired-out"
  | "timed-out"
  | "obstructing-field";

/** Wicket types where the bowler is credited in their bowling figures. */
export const BOWLER_CREDITED_WICKETS: ReadonlySet<WicketType> = new Set([
  "bowled",
  "caught",
  "lbw",
  "stumped",
  "hit-wicket",
]);

/** Wicket types that can only be recorded off a legal, live delivery (not mid-over declarations). */
export const DELIVERY_WICKETS: ReadonlySet<WicketType> = new Set([
  "bowled",
  "caught",
  "lbw",
  "run-out",
  "stumped",
  "hit-wicket",
  "obstructing-field",
]);

export interface WicketDetail {
  type: WicketType;
  /** Name of the batter given out -- striker for everything except a run-out, which may take either end. */
  playerOut: string;
  /** Fielder(s) involved -- catcher, thrower, or keeper for stumped/run-out/caught. */
  fielder?: string;
}

/** One recorded delivery (or a wicket-only event for retirements/timed-out, which don't consume a ball). */
export interface BallEvent {
  id: string;
  timestamp: string;
  inningsNumber: 1 | 2;
  overNumber: number; // 0-indexed
  ballInOver: number; // 1-6, legal-ball sequence within the over (extras keep the same number as the ball they replay)
  strikerName: string;
  nonStrikerName: string;
  bowlerName: string;
  runsBat: number;
  extra: ExtraType | null;
  extraRuns: number;
  isLegal: boolean;
  isFreeHit: boolean;
  wicket: WicketDetail | null;
  /** Team-total runs added by this single event (bat + all extras). */
  totalRuns: number;
}

export interface BatterInningsStats {
  name: string;
  battingOrder: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  isRetired: boolean;
  dismissal: WicketDetail | null;
  strikeRate: number;
}

export interface BowlerInningsStats {
  name: string;
  legalBalls: number;
  runsConceded: number;
  wickets: number;
  maidens: number;
  economy: number;
  oversLabel: string; // "3.4" style display, derived from legalBalls
}

export interface Partnership {
  batterA: string;
  batterB: string;
  runs: number;
  balls: number;
  startOverLabel: string;
  active: boolean;
}

export interface FallOfWicket {
  wicketNumber: number;
  teamRuns: number;
  overLabel: string;
  playerOut: string;
  dismissal: WicketType;
}

export type InningsStatus = "not-started" | "in-progress" | "completed";

export interface InningsState {
  inningsNumber: 1 | 2;
  battingTeam: string;
  bowlingTeam: string;
  status: InningsStatus;

  totalRuns: number;
  totalWickets: number;
  legalBalls: number; // total legal deliveries bowled this innings
  extrasTotal: Record<ExtraType, number>;

  strikerName: string | null;
  nonStrikerName: string | null;
  currentBowlerName: string | null;
  previousOverBowlerName: string | null; // can't bowl the very next over back to back
  isFreeHit: boolean;

  currentOverEvents: BallEvent[]; // events recorded so far in the over in progress
  completedOvers: BallEvent[][]; // one array of events per finished over
  events: BallEvent[]; // full flat timeline, oldest first -- the Event Timeline
  batters: Record<string, BatterInningsStats>;
  battingOrder: string[]; // names in the order they came to the crease
  bowlers: Record<string, BowlerInningsStats>;
  fallOfWickets: FallOfWicket[];
  partnerships: Partnership[]; // last entry is the current (active) partnership
}

export type MatchLiveStatus = "not-started" | "innings-break" | "in-progress" | "completed";

export interface LiveMatchState {
  fixtureId: string;
  status: MatchLiveStatus;
  currentInnings: 1 | 2;
  format: string;
  oversLimit: number | null;
  rules: FixtureRules;
  venue: FixtureVenue;
  ballType: BallType;
  gender: Gender;
  dayNight: DayNight;
  innings1: InningsState;
  innings2: InningsState | null;
  updatedAt: string;
}

/** Payload the scoring UI builds for a single delivery; the engine (lib/liveScoring/engine.ts) turns this into a new InningsState. */
export interface BallInput {
  runsBat: number;
  extra: ExtraType | null;
  extraRuns: number;
  wicket: WicketDetail | null;
}
