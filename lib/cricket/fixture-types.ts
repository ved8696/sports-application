// Scheduled-match ("fixture") data model.
// Distinct from the parsed Cricsheet Match model in types.ts -- a fixture is a
// match that has been created and scheduled but not yet played, so it has no
// innings/deliveries/result. Written to /data/fixtures/<id>.json by
// app/api/fixtures/route.ts and read back by lib/store/fixture-store.ts.

import type { Gender } from "./types";

export type FixtureCreationType = "friendly" | "league" | "tournament";
export type BallType = "Red" | "White" | "Pink";
export type DayNight = "Day" | "Night" | "Day/Night";
export type RetirementRule = "none" | "retired-out" | "retired-not-out";
export type FixtureStatus = "Scheduled";

export interface FixtureTournament {
  type: FixtureCreationType;
  name: string;
}

export interface FixtureVenue {
  name: string;
  city?: string;
}

export interface FixtureRules {
  oversPerInnings: number | null;
  powerplayOvers: number | null;
  superOver: boolean;
  dls: boolean;
  wideRuns: number;
  noBallRuns: number;
  freeHit: boolean;
  retirement: RetirementRule;
  retirementOverThreshold?: number;
}

export interface Fixture {
  id: string;
  name: string;
  createdAt: string;
  status: FixtureStatus;
  tournament: FixtureTournament;
  format: string;
  overs: number | null;
  ballType: BallType;
  gender: Gender;
  ageGroup: string;
  matchType: string;
  venue: FixtureVenue;
  date: string;
  startTime: string;
  timeZone: string;
  dayNight: DayNight;
  rules: FixtureRules;
}

/** Shape submitted to POST /api/fixtures -- server assigns id/createdAt/status. */
export type FixtureDraft = Omit<Fixture, "id" | "createdAt" | "status">;
