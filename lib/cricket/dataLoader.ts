// Server-only. Auto-discovers every *.json file in /data, classifies it by
// structural shape (match / player bio registry / video metadata), and parses
// it into the normalized model. Adding a new file to /data requires no code
// changes -- this module globs the directory at read time.

import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Match, PlayerBio, VideoMetadata } from "./types";
import { parseCricsheetMatch } from "./cricketParser";
import type { RawMatch, RawPlayerBioEntry, RawVideoEntry } from "./raw-types";

const DATA_DIR = path.join(process.cwd(), "data");

export interface CricketDataset {
  matches: Match[];
  playerBios: Record<string, PlayerBio>;
  warnings: string[];
}

function isRawMatch(json: unknown): json is RawMatch {
  return (
    typeof json === "object" &&
    json !== null &&
    "info" in json &&
    "innings" in json &&
    Array.isArray((json as { innings: unknown }).innings)
  );
}

function isPlayerBioArray(json: unknown): json is RawPlayerBioEntry[] {
  return (
    Array.isArray(json) &&
    json.length > 0 &&
    typeof json[0] === "object" &&
    json[0] !== null &&
    ("battingHand" in json[0] || "batting_hand" in json[0] || "bowlingStyle" in json[0] || "bowling_style" in json[0])
  );
}

function isVideoArray(json: unknown): json is RawVideoEntry[] {
  return (
    Array.isArray(json) &&
    json.length > 0 &&
    typeof json[0] === "object" &&
    json[0] !== null &&
    ("clipUrl" in json[0] || "clip_url" in json[0])
  );
}

function normalizeBattingHand(value: string | undefined): PlayerBio["battingHand"] {
  if (!value) return undefined;
  const v = value.toLowerCase();
  if (v.startsWith("l")) return "LHB";
  if (v.startsWith("r")) return "RHB";
  return "Unknown";
}

function normalizeBowlingStyle(value: string | undefined): PlayerBio["bowlingStyle"] {
  if (!value) return undefined;
  const known: PlayerBio["bowlingStyle"][] = [
    "Right-arm Pace",
    "Left-arm Pace",
    "Off Spin",
    "Leg Spin",
    "Left-arm Orthodox",
    "Left-arm Wrist Spin",
  ];
  const match = known.find((k) => k?.toLowerCase() === value.toLowerCase());
  return match ?? "Unknown";
}

function parsePlayerBios(entries: RawPlayerBioEntry[]): Record<string, PlayerBio> {
  const map: Record<string, PlayerBio> = {};
  for (const entry of entries) {
    const name = entry.name;
    if (!name) continue;
    map[name] = {
      name,
      id: entry.id,
      battingHand: normalizeBattingHand(entry.battingHand ?? entry.batting_hand),
      bowlingStyle: normalizeBowlingStyle(entry.bowlingStyle ?? entry.bowling_style),
      country: entry.country,
    };
  }
  return map;
}

function parseVideoEntries(entries: RawVideoEntry[]): Map<string, VideoMetadata[]> {
  const byMatch = new Map<string, VideoMetadata[]>();
  entries.forEach((entry, i) => {
    const matchId = entry.matchId ?? entry.match_id;
    if (!matchId) return;
    const clip: VideoMetadata = {
      clipId: entry.clipId ?? entry.clip_id ?? `clip-${i}`,
      clipUrl: entry.clipUrl ?? entry.clip_url ?? "",
      thumbnailUrl: entry.thumbnailUrl ?? entry.thumbnail_url,
      player: entry.player,
      over: entry.over,
      shotType: entry.shotType ?? entry.shot_type,
      confidence: entry.confidence,
    };
    const list = byMatch.get(matchId) ?? [];
    list.push(clip);
    byMatch.set(matchId, list);
  });
  return byMatch;
}

let cache: CricketDataset | null = null;

/** Reads and parses every JSON file in /data. Result is memoized for the life of the server process. */
export function loadCricketData(): CricketDataset {
  if (cache) return cache;

  const warnings: string[] = [];
  const matches: Match[] = [];
  let playerBios: Record<string, PlayerBio> = {};
  const videoByMatch = new Map<string, VideoMetadata[]>();

  let files: string[] = [];
  try {
    files = fs.readdirSync(DATA_DIR).filter((f) => f.toLowerCase().endsWith(".json"));
  } catch {
    return { matches: [], playerBios: {}, warnings: [`Data directory not found: ${DATA_DIR}`] };
  }

  for (const file of files) {
    const fullPath = path.join(DATA_DIR, file);
    let json: unknown;
    try {
      json = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    } catch (err) {
      warnings.push(`Skipped ${file}: invalid JSON (${(err as Error).message})`);
      continue;
    }

    if (isRawMatch(json)) {
      const match = parseCricsheetMatch(json, file);
      if (match) {
        matches.push(match);
      } else {
        warnings.push(`Skipped ${file}: recognized as a match file but missing required fields`);
      }
    } else if (isPlayerBioArray(json)) {
      playerBios = { ...playerBios, ...parsePlayerBios(json) };
    } else if (isVideoArray(json)) {
      for (const [matchId, clips] of parseVideoEntries(json)) {
        const existing = videoByMatch.get(matchId) ?? [];
        videoByMatch.set(matchId, [...existing, ...clips]);
      }
    } else {
      warnings.push(`Skipped ${file}: unrecognized JSON shape (not a match, player-bio, or video file)`);
    }
  }

  for (const match of matches) {
    const clips = videoByMatch.get(match.id);
    if (clips) match.video = clips;
  }

  cache = { matches, playerBios, warnings };
  return cache;
}
