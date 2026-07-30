import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Tournament } from "@/lib/tournament/types";

// Filesystem primitives for tournaments, mirroring lib/server/fixtures-repo.ts
// exactly. Stored under data/tournaments/ -- a sibling of data/fixtures/, kept
// out of lib/cricket/dataLoader.ts's top-level, non-recursive /data glob for
// the same reason fixtures are.

export const TOURNAMENTS_DIR = path.join(process.cwd(), "data", "tournaments");

export const TOURNAMENT_ID_RE = /^tournament-[0-9a-fA-F-]+$/;

export function listTournaments(): Tournament[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(TOURNAMENTS_DIR).filter((f) => f.toLowerCase().endsWith(".json"));
  } catch {
    return [];
  }
  const tournaments: Tournament[] = [];
  for (const file of files) {
    try {
      tournaments.push(JSON.parse(fs.readFileSync(path.join(TOURNAMENTS_DIR, file), "utf-8")) as Tournament);
    } catch {
      // Skip an unreadable/corrupt file rather than failing the whole list.
    }
  }
  return tournaments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function readTournament(id: string): Tournament | null {
  if (!TOURNAMENT_ID_RE.test(id)) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(TOURNAMENTS_DIR, `${id}.json`), "utf-8")) as Tournament;
  } catch {
    return null;
  }
}

export function writeTournament(tournament: Tournament): void {
  fs.mkdirSync(TOURNAMENTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(TOURNAMENTS_DIR, `${tournament.id}.json`), JSON.stringify(tournament, null, 2));
}

export function deleteTournament(id: string): boolean {
  if (!TOURNAMENT_ID_RE.test(id)) return false;
  try {
    fs.unlinkSync(path.join(TOURNAMENTS_DIR, `${id}.json`));
    return true;
  } catch {
    return false;
  }
}
