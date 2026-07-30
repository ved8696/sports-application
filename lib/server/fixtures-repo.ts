import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Fixture } from "@/lib/cricket/fixture-types";

// Shared filesystem primitives for the fixtures store -- kept in one place so
// app/api/fixtures/route.ts (list/create) and app/api/fixtures/[id]/route.ts
// (read/update) don't each reimplement the same read/write logic.

export const FIXTURES_DIR = path.join(process.cwd(), "data", "fixtures");

// Fixture ids are always server-generated as "fixture-<uuid>". Validating the
// shape before it touches a filesystem path closes off path traversal via a
// crafted id segment.
export const FIXTURE_ID_RE = /^fixture-[0-9a-fA-F-]+$/;

export function listFixtures(): Fixture[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(FIXTURES_DIR).filter((f) => f.toLowerCase().endsWith(".json"));
  } catch {
    return [];
  }
  const fixtures: Fixture[] = [];
  for (const file of files) {
    try {
      fixtures.push(JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, file), "utf-8")) as Fixture);
    } catch {
      // Skip an unreadable/corrupt fixture file rather than failing the whole list.
    }
  }
  return fixtures.sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
}

export function readFixture(id: string): Fixture | null {
  if (!FIXTURE_ID_RE.test(id)) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, `${id}.json`), "utf-8")) as Fixture;
  } catch {
    return null;
  }
}

export function writeFixture(fixture: Fixture): void {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  fs.writeFileSync(path.join(FIXTURES_DIR, `${fixture.id}.json`), JSON.stringify(fixture, null, 2));
}

export function deleteFixture(id: string): boolean {
  if (!FIXTURE_ID_RE.test(id)) return false;
  try {
    fs.unlinkSync(path.join(FIXTURES_DIR, `${id}.json`));
    return true;
  } catch {
    return false;
  }
}

export function listFixturesByTournament(tournamentId: string): Fixture[] {
  return listFixtures().filter((f) => f.tournamentId === tournamentId);
}
