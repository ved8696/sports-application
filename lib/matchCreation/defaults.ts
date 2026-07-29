// Static option lists and format-driven defaults for the match-creation wizard.
// Kept in one place so every step reads the same vocabulary instead of each
// screen hardcoding its own copy.

import { isLimitedOvers } from "@/lib/cricket/filters";
import type { BallType, DayNight, FixtureRules, RetirementRule } from "@/lib/cricket/fixture-types";

export const MATCH_FORMATS = ["T10", "T20", "ODI", "Test", "Custom"] as const;
export type MatchFormatOption = (typeof MATCH_FORMATS)[number];

export const BALL_TYPES: BallType[] = ["Red", "White", "Pink"];

export const GENDER_OPTIONS: { value: "male" | "female" | "mixed"; label: string }[] = [
  { value: "male", label: "Men's" },
  { value: "female", label: "Women's" },
  { value: "mixed", label: "Mixed" },
];

export const AGE_GROUPS = ["Open", "Under-19", "Under-16", "Under-14", "Masters (35+)"];

export const MATCH_TYPES = ["League Stage", "Quarterfinal", "Semifinal", "Final", "Practice"];

export const DAY_NIGHT_OPTIONS: DayNight[] = ["Day", "Night", "Day/Night"];

export const RETIREMENT_OPTIONS: { value: RetirementRule; label: string }[] = [
  { value: "none", label: "Not permitted" },
  { value: "retired-out", label: "Retired out" },
  { value: "retired-not-out", label: "Retired not out" },
];

/** Overs a format implies by default; null means unlimited (Test) or user-entered (Custom). */
export function defaultOversForFormat(format: string): number | null {
  switch (format) {
    case "T10":
      return 10;
    case "T20":
      return 20;
    case "ODI":
      return 50;
    case "Test":
      return null;
    default:
      return null;
  }
}

export function defaultPowerplayOvers(overs: number | null): number | null {
  if (overs === null) return null;
  if (overs <= 10) return Math.min(2, overs);
  if (overs <= 20) return 6;
  return 10;
}

export function defaultRulesForFormat(format: string, overs: number | null): FixtureRules {
  const limitedOvers = isLimitedOvers(format) || format === "T10" || format === "Custom";
  return {
    oversPerInnings: overs,
    powerplayOvers: limitedOvers ? defaultPowerplayOvers(overs) : null,
    superOver: limitedOvers,
    dls: limitedOvers,
    wideRuns: 1,
    noBallRuns: 1,
    freeHit: limitedOvers,
    retirement: "retired-out",
    retirementOverThreshold: undefined,
  };
}

export function formatSupportsLimitedOversRules(format: string): boolean {
  return format !== "Test";
}

/**
 * Some seed venue records already embed the city in `name` (e.g. "M
 * Chinnaswamy Stadium, Bangalore") while others keep it purely in `city` --
 * that's how the underlying Cricsheet source data is punctuated. Avoid
 * showing the city twice when it's already part of the name.
 */
export function venueLabel(venue: { name: string; city?: string }): string {
  if (!venue.city) return venue.name;
  if (venue.name.toLowerCase().includes(venue.city.toLowerCase())) return venue.name;
  return `${venue.name}, ${venue.city}`;
}

export function commonTimeZones(): string[] {
  const detected = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  const curated = [
    "Asia/Kolkata",
    "Asia/Dubai",
    "Asia/Singapore",
    "Australia/Sydney",
    "Europe/London",
    "America/New_York",
    "America/Los_Angeles",
    "Pacific/Auckland",
    "UTC",
  ];
  return Array.from(new Set([detected, ...curated]));
}
