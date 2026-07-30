import { NextResponse } from "next/server";
import { readFixture, writeFixture } from "@/lib/server/fixtures-repo";
import { readLiveMatch, writeLiveMatch, LIVE_ID_RE } from "@/lib/server/live-repo";
import { createLiveMatchState, type OpeningSelection } from "@/lib/liveScoring/initialize";
import type { LiveMatchState } from "@/lib/liveScoring/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const state = readLiveMatch(id);
  if (!state) return NextResponse.json({ error: "Live match not found." }, { status: 404 });
  return NextResponse.json({ state });
}

function isValidOpeners(body: unknown): body is OpeningSelection {
  if (!body || typeof body !== "object") return false;
  const o = body as Partial<OpeningSelection>;
  return Boolean(
    o.strikerName?.trim() &&
      o.nonStrikerName?.trim() &&
      o.bowlerName?.trim() &&
      o.strikerName !== o.nonStrikerName
  );
}

/** Starts live scoring for a fixture: seeds innings 1 from the fixture's teams/toss plus the chosen openers, and flips the fixture to "Live". */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fixture = readFixture(id);
  if (!fixture) return NextResponse.json({ error: "Match not found." }, { status: 404 });
  if (!fixture.teams || !fixture.playingXI || !fixture.toss) {
    return NextResponse.json({ error: "Complete team selection, Playing XI, and the toss before starting the match." }, { status: 400 });
  }

  const existing = readLiveMatch(id);
  if (existing) return NextResponse.json({ state: existing }, { status: 200 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValidOpeners(body)) {
    return NextResponse.json({ error: "Select the opening striker, non-striker, and bowler." }, { status: 400 });
  }

  let state: LiveMatchState;
  try {
    state = createLiveMatchState(fixture, body);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to start the match." }, { status: 400 });
  }

  writeLiveMatch(state);
  if (fixture.status !== "Live") writeFixture({ ...fixture, status: "Live" });

  return NextResponse.json({ state }, { status: 201 });
}

function isValidLiveState(body: unknown, id: string): body is LiveMatchState {
  if (!body || typeof body !== "object") return false;
  const s = body as Partial<LiveMatchState>;
  return Boolean(
    s.fixtureId === id &&
      LIVE_ID_RE.test(s.fixtureId) &&
      (s.status === "not-started" || s.status === "innings-break" || s.status === "in-progress" || s.status === "completed") &&
      (s.currentInnings === 1 || s.currentInnings === 2) &&
      s.innings1 &&
      typeof s.innings1 === "object"
  );
}

/** Persists the full live-state snapshot -- called after every ball so nothing is ever lost mid-innings. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!LIVE_ID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid match id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValidLiveState(body, id)) {
    return NextResponse.json({ error: "Invalid live match state." }, { status: 400 });
  }

  const state: LiveMatchState = { ...body, updatedAt: new Date().toISOString() };
  writeLiveMatch(state);
  return NextResponse.json({ state });
}
