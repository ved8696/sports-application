// Dynamic filter option extraction + filter application.
// Every value a user can pick is derived from the loaded dataset -- nothing here
// is hardcoded. A field with no data simply produces an empty option list, and
// the corresponding UI control should be hidden (see store selectors).

import type { Ball, Match, MatchFormat, PlayerBio } from "./types";
import { uniqueSorted, matchesSearch } from "./helpers";

export const ALL = "All";

export type OversPhase = "All Overs" | "Powerplay" | "Middle Overs" | "Death Overs";

export interface FilterState {
  tournament: string;
  season: string;
  format: string;
  venue: string;
  team: string;
  opponent: string;
  player: string;
  bowler: string;
  battingHand: string;
  bowlingStyle: string;
  year: string;
  result: string;
  phase: OversPhase;
  search: string;
  /** 1-indexed, inclusive. overTo === null means unbounded. */
  overFrom: number;
  overTo: number | null;
}

export function defaultFilterState(): FilterState {
  return {
    tournament: ALL,
    season: ALL,
    format: ALL,
    venue: ALL,
    team: ALL,
    opponent: ALL,
    player: ALL,
    bowler: ALL,
    battingHand: ALL,
    bowlingStyle: ALL,
    year: ALL,
    result: ALL,
    phase: "All Overs",
    search: "",
    overFrom: 1,
    overTo: null,
  };
}

export interface FilterOptions {
  tournaments: string[];
  seasons: string[];
  formats: string[];
  venues: string[];
  teams: string[];
  players: string[];
  bowlers: string[];
  years: string[];
  results: string[];
  battingHands: string[];
  bowlingStyles: string[];
  hasPhaseData: boolean;
  hasBattingHandData: boolean;
  hasBowlingStyleData: boolean;
  /** Highest 1-indexed over number seen in the loaded dataset -- upper bound for the over-range filter. */
  maxOver: number;
}

/**
 * Every dropdown's option list, derived live from whatever matches are currently
 * loaded. Cross-filtering: pass an already partially-filtered match list to
 * narrow downstream options (e.g. seasons narrows once a tournament is chosen).
 */
export function extractFilterOptions(matches: Match[], playerBios: Record<string, PlayerBio>): FilterOptions {
  const formats = uniqueSorted(matches.map((m) => m.format));
  const bowlersSet = new Set<string>();
  const battersSet = new Set<string>();
  let maxOver = 1;
  for (const match of matches) {
    for (const inning of match.innings) {
      for (const over of inning.overs) {
        if (over.overNumber + 1 > maxOver) maxOver = over.overNumber + 1;
        for (const ball of over.balls) {
          battersSet.add(ball.batter);
          bowlersSet.add(ball.bowler);
        }
      }
    }
  }

  const bioValues = Object.values(playerBios);

  return {
    tournaments: uniqueSorted(matches.map((m) => m.tournament.name)),
    seasons: uniqueSorted(matches.map((m) => m.season.label)),
    formats,
    venues: uniqueSorted(matches.map((m) => m.venue.name)),
    teams: uniqueSorted(matches.flatMap((m) => m.teams)),
    players: uniqueSorted(Array.from(battersSet)),
    bowlers: uniqueSorted(Array.from(bowlersSet)),
    years: uniqueSorted(matches.map((m) => (m.year ? String(m.year) : undefined))).sort((a, b) => Number(b) - Number(a)),
    results: uniqueSorted(matches.map((m) => m.result.resultType)),
    battingHands: uniqueSorted(bioValues.map((b) => b.battingHand)),
    bowlingStyles: uniqueSorted(bioValues.map((b) => b.bowlingStyle)),
    hasPhaseData: formats.some((f) => isLimitedOvers(f)),
    hasBattingHandData: bioValues.some((b) => b.battingHand),
    hasBowlingStyleData: bioValues.some((b) => b.bowlingStyle),
    maxOver,
  };
}

export function isLimitedOvers(format: MatchFormat): boolean {
  return format === "T20" || format === "IT20" || format === "ODI" || format === "ODM" || format === "MDM";
}

/** Buckets a zero-indexed over number into a scoring phase for the given format. */
export function phaseForOver(overIndex: number, format: MatchFormat): OversPhase {
  const over1Based = overIndex + 1;
  if (format === "T20" || format === "IT20") {
    if (over1Based <= 6) return "Powerplay";
    if (over1Based <= 15) return "Middle Overs";
    return "Death Overs";
  }
  if (format === "ODI" || format === "ODM" || format === "MDM") {
    if (over1Based <= 10) return "Powerplay";
    if (over1Based <= 40) return "Middle Overs";
    return "Death Overs";
  }
  return "All Overs";
}

function matchPassesFilters(match: Match, filters: FilterState): boolean {
  if (filters.tournament !== ALL && match.tournament.name !== filters.tournament) return false;
  if (filters.season !== ALL && match.season.label !== filters.season) return false;
  if (filters.format !== ALL && match.format !== filters.format) return false;
  if (filters.venue !== ALL && match.venue.name !== filters.venue) return false;
  if (filters.year !== ALL && String(match.year) !== filters.year) return false;
  if (filters.result !== ALL && match.result.resultType !== filters.result) return false;
  if (filters.team !== ALL && !match.teams.includes(filters.team)) return false;
  if (filters.opponent !== ALL && !match.teams.includes(filters.opponent)) return false;
  if (filters.team !== ALL && filters.opponent !== ALL && filters.team === filters.opponent) return false;

  if (filters.search) {
    const searchable = [
      match.tournament.name,
      match.season.label,
      match.venue.name,
      match.venue.city,
      ...match.teams,
      match.id,
      ...match.playerOfMatch,
    ];
    if (!matchesSearch(searchable, filters.search)) return false;
  }

  return true;
}

export interface FilteredBall extends Ball {
  matchId: string;
  inningsIndex: number;
  format: MatchFormat;
  phase: OversPhase;
}

function ballPassesFilters(ball: Ball, format: MatchFormat, filters: FilterState, playerBios: Record<string, PlayerBio>): boolean {
  // This is a batting-centric dashboard (runs, strike rate, boundaries, dot%,
  // wickets lost while batting) -- "Team" narrows to that team's batting
  // innings specifically, not just "any match involving them".
  if (filters.team !== ALL && ball.battingTeam !== filters.team) return false;
  if (filters.opponent !== ALL && ball.bowlingTeam !== filters.opponent) return false;
  if (filters.player !== ALL && ball.batter !== filters.player) return false;
  if (filters.bowler !== ALL && ball.bowler !== filters.bowler) return false;

  const over1Indexed = ball.over + 1;
  if (over1Indexed < filters.overFrom) return false;
  if (filters.overTo !== null && over1Indexed > filters.overTo) return false;

  if (filters.phase !== "All Overs") {
    if (phaseForOver(ball.over, format) !== filters.phase) return false;
  }

  if (filters.battingHand !== ALL) {
    const bio = playerBios[ball.batter];
    if (!bio || bio.battingHand !== filters.battingHand) return false;
  }

  if (filters.bowlingStyle !== ALL) {
    const bio = playerBios[ball.bowler];
    if (!bio || bio.bowlingStyle !== filters.bowlingStyle) return false;
  }

  return true;
}

/**
 * Applies every filter and returns both the surviving matches and their
 * flattened, ball-level deliveries -- the single dataset every KPI, chart,
 * and table aggregation is built from.
 */
export function applyFilters(
  matches: Match[],
  filters: FilterState,
  playerBios: Record<string, PlayerBio>
): { matches: Match[]; deliveries: FilteredBall[] } {
  const filteredMatches = matches.filter((m) => matchPassesFilters(m, filters));
  const deliveries: FilteredBall[] = [];

  for (const match of filteredMatches) {
    for (const inning of match.innings) {
      for (const over of inning.overs) {
        for (const ball of over.balls) {
          if (!ballPassesFilters(ball, match.format, filters, playerBios)) continue;
          deliveries.push({
            ...ball,
            matchId: match.id,
            inningsIndex: inning.inningsIndex,
            format: match.format,
            phase: phaseForOver(ball.over, match.format),
          });
        }
      }
    }
  }

  return { matches: filteredMatches, deliveries };
}
