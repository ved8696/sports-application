// Points-table computation. Reads only two existing data sources -- the
// tournament's own Fixtures (lib/store/fixture-store.ts, filtered by
// tournamentId) and the archived Match history (lib/store/cricket-store.ts,
// the same historical dataset every other analytics screen already reads) --
// and joins them by team names + tournament name. No parallel results ledger
// is kept; a completed match already carries everything needed once archived.

import type { Fixture } from "@/lib/cricket/fixture-types";
import type { Match } from "@/lib/cricket/types";

export interface StandingsRow {
  team: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  runsFor: number;
  oversFor: number;
  runsAgainst: number;
  oversAgainst: number;
  nrr: number;
  points: number;
  qualified: boolean;
}

const FULL_QUOTA_WHEN_ALL_OUT = true;

function inningsOvers(innings: Match["innings"][number], oversLimit: number): number {
  const full = innings.legalBallCount / 6;
  // Standard NRR convention: a bowled-out side is credited the full overs
  // quota (rather than the balls actually bowled) when computing the rate
  // *against* them, since being dismissed early shouldn't inflate the
  // bowling side's run rate.
  if (FULL_QUOTA_WHEN_ALL_OUT && innings.totalWickets >= 10) return oversLimit;
  return full;
}

/** Matches this tournament's own archived history -- joined by tournament name (stamped onto every generated fixture) and the exact team pair. */
function findArchivedMatch(matches: Match[], tournamentName: string, teamA: string, teamB: string): Match | null {
  return (
    matches.find(
      (m) =>
        m.tournament.name === tournamentName &&
        m.teams.length === 2 &&
        m.teams.includes(teamA) &&
        m.teams.includes(teamB)
    ) ?? null
  );
}

export function computeStandings(
  tournamentName: string,
  teamNames: string[],
  fixtures: Fixture[],
  matches: Match[],
  qualifyCount: number
): StandingsRow[] {
  const rows = new Map<string, StandingsRow>(
    teamNames.map((team) => [
      team,
      { team, played: 0, won: 0, lost: 0, tied: 0, noResult: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0, nrr: 0, points: 0, qualified: false },
    ])
  );

  const completed = fixtures.filter((f) => f.status === "Completed" && f.teams);
  for (const fixture of completed) {
    const [teamA, teamB] = fixture.teams!;
    const match = findArchivedMatch(matches, tournamentName, teamA.name, teamB.name);
    if (!match) continue;

    const oversLimit = fixture.rules.oversPerInnings ?? match.innings[0]?.overs.length ?? 20;
    const inningsByTeam = new Map(match.innings.map((inn) => [inn.battingTeam, inn]));

    for (const [teamName, oppName] of [
      [teamA.name, teamB.name],
      [teamB.name, teamA.name],
    ] as const) {
      const row = rows.get(teamName);
      if (!row) continue;
      const own = inningsByTeam.get(teamName);
      const opp = inningsByTeam.get(oppName);
      if (!own || !opp) continue;

      row.played += 1;
      row.runsFor += own.totalRuns;
      row.oversFor += inningsOvers(own, oversLimit);
      row.runsAgainst += opp.totalRuns;
      row.oversAgainst += inningsOvers(opp, oversLimit);

      if (match.result.resultType === "tie") {
        row.tied += 1;
        row.points += 1;
      } else if (match.result.resultType === "no result") {
        row.noResult += 1;
        row.points += 1;
      } else if (match.result.winner === teamName) {
        row.won += 1;
        row.points += 2;
      } else if (match.result.winner === oppName) {
        row.lost += 1;
      }
    }
  }

  for (const row of rows.values()) {
    const rateFor = row.oversFor > 0 ? row.runsFor / row.oversFor : 0;
    const rateAgainst = row.oversAgainst > 0 ? row.runsAgainst / row.oversAgainst : 0;
    row.nrr = Math.round((rateFor - rateAgainst) * 100) / 100;
  }

  const sorted = Array.from(rows.values()).sort((a, b) => b.points - a.points || b.nrr - a.nrr);
  sorted.forEach((row, i) => {
    row.qualified = i < qualifyCount;
  });
  return sorted;
}
