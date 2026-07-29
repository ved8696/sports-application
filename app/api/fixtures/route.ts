import "server-only";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import type { Fixture, FixtureDraft } from "@/lib/cricket/fixture-types";

// Scheduled matches created through the mobile wizard, stored as individual
// JSON files under data/fixtures/. Kept in a subdirectory (rather than
// alongside the Cricsheet match files) so lib/cricket/dataLoader.ts's
// top-level, non-recursive /data glob never sees them -- fixtures and
// completed-match history stay on separate read paths.
export const dynamic = "force-dynamic";

const FIXTURES_DIR = path.join(process.cwd(), "data", "fixtures");

function readFixtures(): Fixture[] {
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

export async function GET() {
  return NextResponse.json({ fixtures: readFixtures() });
}

function isValidDraft(body: unknown): body is FixtureDraft {
  if (!body || typeof body !== "object") return false;
  const d = body as Partial<FixtureDraft>;
  return Boolean(
    d.name?.trim() &&
      d.tournament?.type &&
      d.format &&
      d.ballType &&
      d.gender &&
      d.venue?.name?.trim() &&
      d.date &&
      d.startTime &&
      d.timeZone &&
      d.dayNight &&
      d.rules
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidDraft(body)) {
    return NextResponse.json({ error: "Missing required match details." }, { status: 400 });
  }

  const fixture: Fixture = {
    ...body,
    id: `fixture-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    status: "Scheduled",
  };

  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  fs.writeFileSync(path.join(FIXTURES_DIR, `${fixture.id}.json`), JSON.stringify(fixture, null, 2));

  return NextResponse.json({ fixture }, { status: 201 });
}
