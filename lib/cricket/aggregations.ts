// Every number the dashboard renders is computed here from normalized data.
// Components never touch raw JSON or perform statistical math themselves --
// they call a selector (lib/store/cricket-store.ts) which memoizes these.

import type { BatterStats, Match, PlayerBio } from "./types";
import type { FilteredBall, OversPhase } from "./filters";
import { battingAverage, economyRate, percentage, round, safeDivide, strikeRate } from "./statistics";

// Validated categorical order (dataviz skill, dark mode, surface #1a1a1a):
// blue, wood, red anchor the brand palette; teal/violet/magenta fill out
// remaining slots and pass adjacent-pair CVD separation in that order.
const PALETTE = ["var(--electric)", "var(--emerald)", "var(--rose)", "#0d9488", "#8b7fe8", "#d0699a"];

// ---------- KPI cards ----------

export interface Kpi {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  delta: string;
  trend: "up" | "down";
  accent: "emerald" | "electric" | "amber" | "rose";
}

function deltaAgainstBaseline(current: number, baseline: number): { delta: string; trend: "up" | "down" } {
  if (!baseline) return { delta: "+0.0%", trend: "up" };
  const change = ((current - baseline) / baseline) * 100;
  const trend: "up" | "down" = change >= 0 ? "up" : "down";
  return { delta: `${change >= 0 ? "+" : ""}${round(change, 1)}%`, trend };
}

export function computeKpis(deliveries: FilteredBall[], baseline: FilteredBall[]): Kpi[] {
  const stat = (set: FilteredBall[]) => {
    const legalBalls = set.filter((b) => b.isLegalDelivery);
    const runs = set.reduce((sum, b) => sum + b.runsTotal, 0);
    const batterRuns = set.reduce((sum, b) => sum + b.runsBatter, 0);
    const wickets = set.filter((b) => b.wicket).length;
    const boundaries = set.filter((b) => b.isFour || b.isSix).length;
    const dots = legalBalls.filter((b) => b.isDot).length;
    return {
      runs,
      strikeRate: strikeRate(batterRuns, legalBalls.length),
      average: battingAverage(batterRuns, wickets),
      boundaries,
      dotPct: percentage(dots, legalBalls.length),
      wickets,
    };
  };

  const cur = stat(deliveries);
  const base = stat(baseline);

  return [
    { label: "Total Runs", value: cur.runs, ...deltaAgainstBaseline(cur.runs, base.runs), accent: "emerald" },
    { label: "Strike Rate", value: cur.strikeRate, decimals: 1, ...deltaAgainstBaseline(cur.strikeRate, base.strikeRate), accent: "electric" },
    { label: "Average", value: cur.average, decimals: 1, ...deltaAgainstBaseline(cur.average, base.average), accent: "emerald" },
    { label: "Boundaries", value: cur.boundaries, ...deltaAgainstBaseline(cur.boundaries, base.boundaries), accent: "electric" },
    { label: "Dot Ball %", value: cur.dotPct, suffix: "%", ...deltaAgainstBaseline(cur.dotPct, base.dotPct), accent: "amber" },
    { label: "Wickets Lost", value: cur.wickets, ...deltaAgainstBaseline(cur.wickets, base.wickets), accent: "rose" },
  ];
}

// ---------- Runs by Batter ----------

export interface RunsByBatterPoint {
  name: string;
  runs: number;
  strikeRate: number;
}

export function computeRunsByBatter(deliveries: FilteredBall[], limit = 8): RunsByBatterPoint[] {
  const byBatter = new Map<string, { runs: number; balls: number }>();
  for (const ball of deliveries) {
    const entry = byBatter.get(ball.batter) ?? { runs: 0, balls: 0 };
    entry.runs += ball.runsBatter;
    if (ball.isLegalDelivery) entry.balls += 1;
    byBatter.set(ball.batter, entry);
  }

  return Array.from(byBatter.entries())
    .map(([name, v]) => ({ name, runs: v.runs, strikeRate: strikeRate(v.runs, v.balls) }))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, limit);
}

// ---------- Runs by Over ----------

export interface RunsByOverPoint {
  over: string;
  runs: number;
}

export function computeRunsByOver(deliveries: FilteredBall[]): RunsByOverPoint[] {
  const byOver = new Map<number, number>();
  for (const ball of deliveries) {
    byOver.set(ball.over, (byOver.get(ball.over) ?? 0) + ball.runsTotal);
  }
  return Array.from(byOver.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([over, runs]) => ({ over: String(over + 1), runs }));
}

// ---------- Boundary Distribution ----------
// Cricsheet ball-by-ball data has no shot-direction/zone field, so a literal
// "leg side vs off side" split can't be derived honestly. Team x boundary-type
// is real, always available, and keeps the same 4-ish-slice pie shape.

export interface BoundarySlice {
  name: string;
  value: number;
  color: string;
}

export function computeBoundaryDistribution(deliveries: FilteredBall[]): BoundarySlice[] {
  const counts = new Map<string, number>();
  for (const ball of deliveries) {
    if (!ball.isFour && !ball.isSix) continue;
    const key = `${ball.battingTeam} ${ball.isSix ? "Sixes" : "Fours"}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  return Array.from(counts.entries())
    .map(([name, count], i) => ({ name, value: percentage(count, total), color: PALETTE[i % PALETTE.length] }))
    .sort((a, b) => b.value - a.value);
}

// ---------- Run Rate Progression ----------
// Cumulative TOTAL runs by over, not an averaged rate -- averaging here would
// blend together every innings in the filtered scope (up to dozens of Test
// innings of wildly different lengths sharing the same over-index), producing
// a smoothed curve that doesn't correspond to any real match. Field names
// (`runRate`, `tournamentAvg`) are kept as-is so the chart component needs no
// prop-name changes -- only what they represent changed, from cricket's
// "average runs per over so far" to a plain running total.

export interface RunRatePoint {
  over: string;
  runRate: number;
  tournamentAvg: number;
}

function cumulativeRunsByOver(deliveries: FilteredBall[]): Map<number, number> {
  const byOver = new Map<number, number>();
  for (const ball of deliveries) {
    byOver.set(ball.over, (byOver.get(ball.over) ?? 0) + ball.runsTotal);
  }
  const overs = Array.from(byOver.keys()).sort((a, b) => a - b);
  const result = new Map<number, number>();
  let cumRuns = 0;
  overs.forEach((over) => {
    cumRuns += byOver.get(over) ?? 0;
    result.set(over, cumRuns);
  });
  return result;
}

export function computeRunRateProgression(deliveries: FilteredBall[], baseline: FilteredBall[]): RunRatePoint[] {
  const current = cumulativeRunsByOver(deliveries);
  const base = cumulativeRunsByOver(baseline);
  const overs = Array.from(current.keys()).sort((a, b) => a - b);
  return overs.map((over) => ({
    over: String(over + 1),
    runRate: current.get(over) ?? 0,
    tournamentAvg: base.get(over) ?? 0,
  }));
}

// ---------- Dismissal Types ----------

export function computeDismissalTypes(deliveries: FilteredBall[]): BoundarySlice[] {
  const counts = new Map<string, number>();
  for (const ball of deliveries) {
    if (!ball.wicket) continue;
    const kind = ball.wicket.kind || "unknown";
    const label = kind.charAt(0).toUpperCase() + kind.slice(1);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  return Array.from(counts.entries())
    .map(([name, count], i) => ({ name, value: percentage(count, total), color: PALETTE[i % PALETTE.length] }))
    .sort((a, b) => b.value - a.value);
}

// ---------- Manhattan Chart ----------

export interface ManhattanPoint {
  over: number;
  runs: number;
  wickets: number;
  phase: OversPhase;
}

const MANHATTAN_MAX_OVERS = 50;

export function computeManhattanData(deliveries: FilteredBall[]): ManhattanPoint[] {
  const byOver = new Map<number, { runs: number; wickets: number; phase: OversPhase }>();
  for (const ball of deliveries) {
    const entry = byOver.get(ball.over) ?? { runs: 0, wickets: 0, phase: ball.phase };
    entry.runs += ball.runsTotal;
    if (ball.wicket) entry.wickets += 1;
    byOver.set(ball.over, entry);
  }
  return Array.from(byOver.entries())
    .sort((a, b) => a[0] - b[0])
    .slice(0, MANHATTAN_MAX_OVERS)
    .map(([over, v]) => ({ over: over + 1, runs: v.runs, wickets: v.wickets, phase: v.phase }));
}

// ---------- Player Statistics Table ----------

function estimateExpectedRuns(balls: number, allRuns: number, allBalls: number): number {
  const leagueRatePerBall = safeDivide(allRuns, allBalls, 0);
  return Math.round(balls * leagueRatePerBall);
}

export function computeBatterStats(deliveries: FilteredBall[], playerBios: Record<string, PlayerBio>): BatterStats[] {
  const totalRuns = deliveries.reduce((s, b) => s + b.runsBatter, 0);
  const totalBalls = deliveries.filter((b) => b.isLegalDelivery).length;

  interface Acc {
    team: string;
    matches: Set<string>;
    innings: Set<string>;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    dismissals: number;
    dots: number;
  }
  const byPlayer = new Map<string, Acc>();

  for (const ball of deliveries) {
    const acc = byPlayer.get(ball.batter) ?? {
      team: ball.battingTeam,
      matches: new Set<string>(),
      innings: new Set<string>(),
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      dismissals: 0,
      dots: 0,
    };
    acc.matches.add(ball.matchId);
    acc.innings.add(`${ball.matchId}-${ball.inningsIndex}`);
    acc.runs += ball.runsBatter;
    if (ball.isLegalDelivery) {
      acc.balls += 1;
      if (ball.isDot) acc.dots += 1;
    }
    if (ball.isFour) acc.fours += 1;
    if (ball.isSix) acc.sixes += 1;
    if (ball.wicket && ball.wicket.playerOut === ball.batter) acc.dismissals += 1;
    byPlayer.set(ball.batter, acc);
  }

  return Array.from(byPlayer.entries()).map(([player, acc]) => ({
    player,
    team: acc.team,
    matches: acc.matches.size,
    innings: acc.innings.size,
    runs: acc.runs,
    balls: acc.balls,
    fours: acc.fours,
    sixes: acc.sixes,
    dismissals: acc.dismissals,
    strikeRate: strikeRate(acc.runs, acc.balls),
    average: battingAverage(acc.runs, acc.dismissals),
    dotBallPct: percentage(acc.dots, acc.balls),
    boundaryPct: percentage(acc.fours + acc.sixes, acc.balls),
    expectedRuns: estimateExpectedRuns(acc.balls, totalRuns, totalBalls),
    hand: playerBios[player]?.battingHand ?? "Unknown",
  }));
}

// ---------- Matches list (Matches page) ----------

export interface MatchSummary {
  id: string;
  teamA: string;
  teamB: string;
  venue: string;
  date: string;
  status: "Completed" | "No Result";
  result?: string;
  scoreA?: string;
  scoreB?: string;
}

function teamTotalLabel(match: Match, team: string): string | undefined {
  const innings = match.innings.filter((i) => i.battingTeam === team);
  if (innings.length === 0) return undefined;
  const runs = innings.reduce((s, i) => s + i.totalRuns, 0);
  const wickets = innings.reduce((s, i) => s + i.totalWickets, 0);
  return `${runs}/${wickets}`;
}

function describeResult(match: Match): string | undefined {
  const r = match.result;
  if (r.resultType === "win" && r.winner) {
    if (r.byWickets) return `${r.winner} won by ${r.byWickets} wicket${r.byWickets > 1 ? "s" : ""}`;
    if (r.byRuns) return `${r.winner} won by ${r.byRuns} run${r.byRuns > 1 ? "s" : ""}`;
    if (r.byInnings) return `${r.winner} won by an innings`;
    return `${r.winner} won`;
  }
  if (r.resultType === "tie") return "Match tied";
  if (r.resultType === "draw") return "Match drawn";
  if (r.resultType === "no result") return "No result";
  return undefined;
}

export function computeMatchSummaries(matches: Match[]): MatchSummary[] {
  return [...matches]
    .sort((a, b) => (b.dates[0] ?? "").localeCompare(a.dates[0] ?? ""))
    .map((m) => ({
      id: m.id,
      teamA: m.teams[0],
      teamB: m.teams[1],
      venue: m.venue.name,
      date: m.dates[0] ?? "Unknown",
      status: m.result.resultType === "no result" ? "No Result" : "Completed",
      result: describeResult(m),
      scoreA: teamTotalLabel(m, m.teams[0]),
      scoreB: teamTotalLabel(m, m.teams[1]),
    }));
}

// ---------- Team standings (Teams page) ----------

export interface TeamSummary {
  id: string;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  matches: number;
  netRunRate: string;
  points: number;
}

export function computeTeamSummaries(matches: Match[]): TeamSummary[] {
  interface Acc {
    wins: number;
    losses: number;
    draws: number;
    matches: number;
    runsFor: number;
    ballsFor: number;
    runsAgainst: number;
    ballsAgainst: number;
  }
  const byTeam = new Map<string, Acc>();
  const get = (team: string): Acc => {
    const existing = byTeam.get(team);
    if (existing) return existing;
    const fresh: Acc = { wins: 0, losses: 0, draws: 0, matches: 0, runsFor: 0, ballsFor: 0, runsAgainst: 0, ballsAgainst: 0 };
    byTeam.set(team, fresh);
    return fresh;
  };

  for (const match of matches) {
    for (const team of match.teams) {
      const acc = get(team);
      acc.matches += 1;
      if (match.result.resultType === "win") {
        if (match.result.winner === team) acc.wins += 1;
        else acc.losses += 1;
      } else if (match.result.resultType === "draw" || match.result.resultType === "tie") {
        acc.draws += 1;
      }
    }
    for (const inning of match.innings) {
      const battingAcc = get(inning.battingTeam);
      battingAcc.runsFor += inning.totalRuns;
      battingAcc.ballsFor += inning.legalBallCount;
      const bowlingAcc = get(inning.bowlingTeam);
      bowlingAcc.runsAgainst += inning.totalRuns;
      bowlingAcc.ballsAgainst += inning.legalBallCount;
    }
  }

  return Array.from(byTeam.entries())
    .map(([name, acc]) => {
      const rrFor = safeDivide(acc.runsFor, safeDivide(acc.ballsFor, 6, 0), 0);
      const rrAgainst = safeDivide(acc.runsAgainst, safeDivide(acc.ballsAgainst, 6, 0), 0);
      const nrr = round(rrFor - rrAgainst, 3);
      return {
        id: name,
        name,
        wins: acc.wins,
        losses: acc.losses,
        draws: acc.draws,
        matches: acc.matches,
        netRunRate: `${nrr >= 0 ? "+" : ""}${nrr.toFixed(3)}`,
        points: acc.wins * 2 + acc.draws * 1,
      };
    })
    .sort((a, b) => b.points - a.points);
}

export { economyRate };
