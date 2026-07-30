import { NextResponse } from "next/server";
import type { Fixture, FixtureDraft } from "@/lib/cricket/fixture-types";
import { listFixtures, writeFixture } from "@/lib/server/fixtures-repo";

// Scheduled matches created through the mobile wizard, stored as individual
// JSON files under data/fixtures/. Kept in a subdirectory (rather than
// alongside the Cricsheet match files) so lib/cricket/dataLoader.ts's
// top-level, non-recursive /data glob never sees them -- fixtures and
// completed-match history stay on separate read paths.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ fixtures: listFixtures() });
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

  writeFixture(fixture);

  return NextResponse.json({ fixture }, { status: 201 });
}
