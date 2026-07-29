// Normalized cricket data model.
// Every visualization and store selector consumes ONLY these types -- never raw JSON.

export type Gender = "male" | "female" | "mixed";
export type TeamType = "international" | "club" | "domestic" | string;
export type MatchFormat = "Test" | "ODI" | "T20" | "IT20" | "MDM" | "ODM" | string;
export type BattingHand = "RHB" | "LHB" | "Unknown";
export type BowlingStyle =
  | "Right-arm Pace"
  | "Left-arm Pace"
  | "Off Spin"
  | "Leg Spin"
  | "Left-arm Orthodox"
  | "Left-arm Wrist Spin"
  | "Unknown";

export interface Venue {
  name: string;
  city?: string;
}

export interface Tournament {
  name: string;
  matchNumber?: number;
}

export interface Season {
  label: string; // e.g. "2016/17" or "2026" as it appears in the source
  year: number; // normalized numeric year (first year in the label) for sorting/filtering
}

export interface Extras {
  wides: number;
  noballs: number;
  byes: number;
  legbyes: number;
  penalty: number;
  total: number;
}

export interface Dismissal {
  playerOut: string;
  kind: string; // "caught" | "bowled" | "lbw" | "run out" | "stumped" | ...
  fielders: string[];
  bowler?: string;
}

export interface Ball {
  over: number; // 0-indexed over number
  ballInOver: number; // sequence within the over as recorded in source
  actualDelivery?: string; // raw "12.4" style label when present
  batter: string;
  bowler: string;
  nonStriker: string;
  battingTeam: string;
  bowlingTeam: string;
  runsBatter: number;
  runsExtras: number;
  runsTotal: number;
  extras: Extras | null;
  wicket: Dismissal | null;
  isLegalDelivery: boolean; // false for wides/no-balls -- excluded from balls-faced/bowled counts
  isDot: boolean;
  isFour: boolean;
  isSix: boolean;
}

export interface Over {
  overNumber: number;
  balls: Ball[];
}

export interface Innings {
  inningsIndex: number;
  battingTeam: string;
  bowlingTeam: string;
  overs: Over[];
  declared: boolean;
  isSuperOver: boolean;
  totalRuns: number;
  totalWickets: number;
  legalBallCount: number;
}

export interface MatchResult {
  winner?: string;
  resultType: "win" | "tie" | "no result" | "draw" | "unknown";
  byRuns?: number;
  byWickets?: number;
  byInnings?: boolean;
  method?: string; // e.g. "D/L"
}

export interface VideoMetadata {
  clipId: string;
  clipUrl: string;
  thumbnailUrl?: string;
  player?: string;
  over?: string;
  shotType?: string;
  confidence?: number;
}

export interface Match {
  id: string;
  sourceFile: string;
  format: MatchFormat;
  gender: Gender;
  teamType: TeamType;
  tournament: Tournament;
  season: Season;
  venue: Venue;
  teams: [string, string];
  dates: string[];
  year: number;
  tossWinner?: string;
  tossDecision?: "bat" | "field";
  playerOfMatch: string[];
  players: Record<string, string[]>; // team name -> player names
  result: MatchResult;
  innings: Innings[];
  ballsPerOver: number;
  /** Present only when a companion video-metadata JSON file supplies clips for this match. */
  video: VideoMetadata[] | null;
}

/** Optional player biographical data, sourced from a separate registry-style JSON file if present. */
export interface PlayerBio {
  name: string;
  id?: string;
  battingHand?: BattingHand;
  bowlingStyle?: BowlingStyle;
  country?: string;
}

// ---------- Derived / aggregate entities (computed by aggregations.ts) ----------

export interface BatterStats {
  player: string;
  team: string;
  matches: number;
  innings: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissals: number;
  strikeRate: number;
  average: number;
  dotBallPct: number;
  boundaryPct: number;
  expectedRuns: number;
  hand: BattingHand;
}

export interface BowlerStats {
  player: string;
  team: string;
  matches: number;
  legalBalls: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  average: number;
  strikeRate: number;
  dotBallPct: number;
}

export interface Partnership {
  matchId: string;
  inningsIndex: number;
  batterA: string;
  batterB: string;
  runs: number;
  balls: number;
}
