// Pure numeric helpers shared by every aggregation. No cricket-domain branching
// beyond basic arithmetic lives here -- keeps aggregations.ts readable.

export function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (!denominator) return fallback;
  return numerator / denominator;
}

export function percentage(part: number, total: number): number {
  return round(safeDivide(part, total, 0) * 100, 1);
}

export function strikeRate(runs: number, balls: number): number {
  return round(safeDivide(runs, balls, 0) * 100, 1);
}

export function battingAverage(runs: number, dismissals: number): number {
  // An undismissed batter has no defined average; report total runs as a
  // reasonable non-dividing-by-zero fallback rather than fabricating a number.
  return round(safeDivide(runs, dismissals, runs), 1);
}

export function economyRate(runsConceded: number, legalBalls: number, ballsPerOver: number): number {
  const overs = safeDivide(legalBalls, ballsPerOver, 0);
  return round(safeDivide(runsConceded, overs, 0), 2);
}

export function bowlingAverage(runsConceded: number, wickets: number): number {
  return round(safeDivide(runsConceded, wickets, runsConceded), 1);
}

export function bowlingStrikeRate(legalBalls: number, wickets: number): number {
  return round(safeDivide(legalBalls, wickets, legalBalls), 1);
}
