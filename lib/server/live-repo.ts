import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { LiveMatchState } from "@/lib/liveScoring/types";

// Live-match state, one JSON file per fixture under data/live/ -- a sibling
// of data/fixtures/ (Sprint 2/3) and, like it, invisible to
// lib/cricket/dataLoader.ts's top-level, non-recursive /data glob.

export const LIVE_DIR = path.join(process.cwd(), "data", "live");

export const LIVE_ID_RE = /^fixture-[0-9a-fA-F-]+$/;

export function readLiveMatch(fixtureId: string): LiveMatchState | null {
  if (!LIVE_ID_RE.test(fixtureId)) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(LIVE_DIR, `${fixtureId}.json`), "utf-8")) as LiveMatchState;
  } catch {
    return null;
  }
}

export function writeLiveMatch(state: LiveMatchState): void {
  fs.mkdirSync(LIVE_DIR, { recursive: true });
  fs.writeFileSync(path.join(LIVE_DIR, `${state.fixtureId}.json`), JSON.stringify(state, null, 2));
}
