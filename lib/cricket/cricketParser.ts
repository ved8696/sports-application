// Pure transform: raw Cricsheet JSON -> normalized Match.
// No I/O here -- dataLoader.ts owns reading files from disk.

import type {
  Ball,
  Dismissal,
  Extras,
  Innings,
  Match,
  MatchResult,
  Over,
  Season,
  Venue,
} from "./types";
import type { RawDelivery, RawInnings, RawMatch, RawOver } from "./raw-types";

function parseSeason(raw: string | number | undefined): Season {
  if (raw === undefined || raw === null) return { label: "Unknown", year: 0 };
  const label = String(raw);
  const yearMatch = label.match(/\d{4}/);
  return { label, year: yearMatch ? parseInt(yearMatch[0], 10) : 0 };
}

function parseVenue(venue: string | undefined, city: string | undefined): Venue {
  if (!venue) return { name: "Unknown Venue", city };
  if (city) return { name: venue, city };
  const parts = venue.split(",").map((p) => p.trim());
  if (parts.length > 1) {
    return { name: parts[0], city: parts[parts.length - 1] };
  }
  return { name: venue };
}

function parseResult(raw: RawMatch): MatchResult {
  const outcome = raw.info?.outcome;
  if (!outcome) return { resultType: "unknown" };

  if (outcome.result === "tie") return { resultType: "tie", method: outcome.method };
  if (outcome.result === "no result") return { resultType: "no result" };

  if (outcome.winner) {
    return {
      resultType: "win",
      winner: outcome.winner,
      byRuns: outcome.by?.runs,
      byWickets: outcome.by?.wickets,
      byInnings: outcome.by?.innings,
      method: outcome.method,
    };
  }

  if (raw.info?.match_type === "Test" && !outcome.result) {
    return { resultType: "draw" };
  }

  return { resultType: "unknown" };
}

function extrasTotal(extras: Extras | null): number {
  if (!extras) return 0;
  return extras.wides + extras.noballs + extras.byes + extras.legbyes + extras.penalty;
}

function parseDelivery(raw: RawDelivery, battingTeam: string, bowlingTeam: string, over: number, ballInOver: number): Ball {
  const runsBatter = raw.runs?.batter ?? 0;
  const runsExtrasTotal = raw.runs?.extras ?? 0;
  const runsTotal = raw.runs?.total ?? runsBatter + runsExtrasTotal;

  const hasExtras =
    raw.extras &&
    (raw.extras.wides || raw.extras.noballs || raw.extras.byes || raw.extras.legbyes || raw.extras.penalty);

  const extras: Extras | null = hasExtras
    ? {
        wides: raw.extras?.wides ?? 0,
        noballs: raw.extras?.noballs ?? 0,
        byes: raw.extras?.byes ?? 0,
        legbyes: raw.extras?.legbyes ?? 0,
        penalty: raw.extras?.penalty ?? 0,
        total: runsExtrasTotal,
      }
    : null;

  const wicketRaw = raw.wickets && raw.wickets.length > 0 ? raw.wickets[0] : undefined;
  const wicket: Dismissal | null = wicketRaw
    ? {
        playerOut: wicketRaw.player_out ?? "Unknown",
        kind: wicketRaw.kind ?? "unknown",
        fielders: (wicketRaw.fielders ?? []).map((f) => f.name ?? "Unknown").filter(Boolean),
        bowler: wicketRaw.bowler,
      }
    : null;

  const isLegalDelivery = !(extras && (extras.wides > 0 || extras.noballs > 0));

  return {
    over,
    ballInOver,
    actualDelivery: raw.actual_delivery,
    batter: raw.batter ?? "Unknown",
    bowler: raw.bowler ?? "Unknown",
    nonStriker: raw.non_striker ?? "Unknown",
    battingTeam,
    bowlingTeam,
    runsBatter,
    runsExtras: extras ? extrasTotal(extras) : runsExtrasTotal,
    runsTotal,
    extras,
    wicket,
    isLegalDelivery,
    isDot: runsTotal === 0,
    isFour: runsBatter === 4,
    isSix: runsBatter === 6,
  };
}

function parseOver(raw: RawOver, index: number, battingTeam: string, bowlingTeam: string): Over {
  const overNumber = raw.over ?? index;
  const deliveries = raw.deliveries ?? [];
  return {
    overNumber,
    balls: deliveries.map((d, i) => parseDelivery(d, battingTeam, bowlingTeam, overNumber, i + 1)),
  };
}

function opponentOf(team: string, teams: [string, string]): string {
  return teams[0] === team ? teams[1] : teams[0];
}

function parseInnings(raw: RawInnings, index: number, teams: [string, string]): Innings {
  const battingTeam = raw.team ?? teams[index % 2] ?? "Unknown";
  const bowlingTeam = opponentOf(battingTeam, teams);
  const overs = (raw.overs ?? []).map((o, i) => parseOver(o, i, battingTeam, bowlingTeam));

  let totalRuns = 0;
  let totalWickets = 0;
  let legalBallCount = 0;
  for (const over of overs) {
    for (const ball of over.balls) {
      totalRuns += ball.runsTotal;
      if (ball.wicket) totalWickets += 1;
      if (ball.isLegalDelivery) legalBallCount += 1;
    }
  }

  return {
    inningsIndex: index,
    battingTeam,
    bowlingTeam,
    overs,
    declared: raw.declared === true,
    isSuperOver: raw.super_over === true,
    totalRuns,
    totalWickets,
    legalBallCount,
  };
}

/**
 * Parses one raw Cricsheet match JSON document into the normalized Match model.
 * Returns null (rather than throwing) when the document is missing the minimum
 * structure required to be useful -- callers should skip and log, never crash.
 */
export function parseCricsheetMatch(raw: RawMatch, sourceFile: string): Match | null {
  if (!raw || typeof raw !== "object" || !raw.info || !Array.isArray(raw.innings)) {
    return null;
  }

  const info = raw.info;
  const rawTeams = info.teams ?? [];
  const teamsFromInnings = Array.from(new Set((raw.innings ?? []).map((i) => i.team).filter((t): t is string => Boolean(t))));
  const teamNames = rawTeams.length >= 2 ? rawTeams : teamsFromInnings.length >= 2 ? teamsFromInnings : ["Team A", "Team B"];
  const teams: [string, string] = [teamNames[0], teamNames[1]];

  const season = parseSeason(info.season);
  const dates = info.dates ?? [];
  const year = dates.length > 0 ? parseInt(dates[0].slice(0, 4), 10) : season.year;

  const id = sourceFile.replace(/\.json$/i, "");

  return {
    id,
    sourceFile,
    format: info.match_type ?? "Unknown",
    gender: info.gender === "female" ? "female" : info.gender === "mixed" ? "mixed" : "male",
    teamType: info.team_type ?? "unknown",
    tournament: { name: info.event?.name ?? "Unknown Tournament", matchNumber: info.event?.match_number },
    season: { label: season.label, year: year || season.year },
    venue: parseVenue(info.venue, info.city),
    teams,
    dates,
    year: year || 0,
    tossWinner: info.toss?.winner,
    tossDecision: info.toss?.decision === "field" ? "field" : info.toss?.decision === "bat" ? "bat" : undefined,
    playerOfMatch: info.player_of_match ?? [],
    players: info.players ?? {},
    result: parseResult(raw),
    innings: (raw.innings ?? []).map((inn, i) => parseInnings(inn, i, teams)),
    ballsPerOver: info.balls_per_over ?? 6,
    video: null,
  };
}
