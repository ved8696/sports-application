// Loose typings for the raw Cricsheet (https://cricsheet.org) JSON match format.
// These describe untrusted external input -- every field is optional/defensive.
// Only cricketParser.ts should ever import this file.

export interface RawRuns {
  batter?: number;
  extras?: number;
  total?: number;
}

export interface RawExtras {
  wides?: number;
  noballs?: number;
  byes?: number;
  legbyes?: number;
  penalty?: number;
}

export interface RawFielder {
  name?: string;
}

export interface RawWicket {
  kind?: string;
  player_out?: string;
  fielders?: RawFielder[];
  bowler?: string;
}

export interface RawDelivery {
  actual_delivery?: string;
  batter?: string;
  bowler?: string;
  non_striker?: string;
  runs?: RawRuns;
  extras?: RawExtras;
  wickets?: RawWicket[];
}

export interface RawOver {
  over?: number;
  deliveries?: RawDelivery[];
}

export interface RawInnings {
  team?: string;
  overs?: RawOver[];
  declared?: boolean;
  super_over?: boolean;
  absent_hurt?: string[];
}

export interface RawOutcome {
  winner?: string;
  by?: { runs?: number; wickets?: number; innings?: boolean };
  result?: string; // "tie" | "no result" | "draw"
  method?: string;
}

export interface RawEvent {
  name?: string;
  match_number?: number;
}

export interface RawToss {
  winner?: string;
  decision?: string;
}

export interface RawInfo {
  balls_per_over?: number;
  dates?: string[];
  event?: RawEvent;
  gender?: string;
  match_type?: string;
  team_type?: string;
  outcome?: RawOutcome;
  player_of_match?: string[];
  players?: Record<string, string[]>;
  season?: string | number;
  teams?: string[];
  toss?: RawToss;
  venue?: string;
  city?: string;
}

export interface RawMatch {
  meta?: { data_version?: string; created?: string; revision?: number };
  info?: RawInfo;
  innings?: RawInnings[];
}

/** A companion file mapping player names/ids to biographical metadata. Detected structurally, not by filename. */
export interface RawPlayerBioEntry {
  name?: string;
  id?: string;
  battingHand?: string;
  batting_hand?: string;
  bowlingStyle?: string;
  bowling_style?: string;
  country?: string;
}

/** A companion file supplying video clip metadata for deliveries. Detected structurally, not by filename. */
export interface RawVideoEntry {
  matchId?: string;
  match_id?: string;
  clipId?: string;
  clip_id?: string;
  clipUrl?: string;
  clip_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  player?: string;
  over?: string;
  shotType?: string;
  shot_type?: string;
  confidence?: number;
}
