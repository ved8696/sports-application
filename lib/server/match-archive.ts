import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { RawMatch } from "@/lib/cricket/raw-types";
import { invalidateCricketDataCache } from "@/lib/cricket/dataLoader";

// Writes a completed live match into the same top-level /data directory
// lib/cricket/dataLoader.ts already globs for Cricsheet match files -- this
// is what makes a finished live-scored match join the historical dataset
// (KPIs, team standings, tournament filters, analytics charts) with zero
// changes to that existing read pipeline.

const DATA_DIR = path.join(process.cwd(), "data");

export function archiveMatch(fixtureId: string, rawMatch: RawMatch): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, `${fixtureId}.json`), JSON.stringify(rawMatch, null, 2));
  invalidateCricketDataCache();
}
