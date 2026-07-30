import { NextResponse } from "next/server";
import { readFixture, writeFixture } from "@/lib/server/fixtures-repo";
import { readLiveMatch } from "@/lib/server/live-repo";
import { archiveMatch } from "@/lib/server/match-archive";
import { liveMatchToRawMatch } from "@/lib/liveScoring/toRawMatch";

export const dynamic = "force-dynamic";

/**
 * Finalizes a match: the client has already computed and PUT the completed
 * LiveMatchState (result/report/potm attached, status "completed") via the
 * existing /api/live/[id] PUT route -- this endpoint reads that saved state
 * back, converts it into a raw Cricsheet-shaped match, and archives it into
 * the main /data folder so it joins the historical dataset. Also flips the
 * fixture to "Completed".
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const fixture = readFixture(id);
  if (!fixture) return NextResponse.json({ error: "Match not found." }, { status: 404 });

  const liveState = readLiveMatch(id);
  if (!liveState) return NextResponse.json({ error: "Live match state not found." }, { status: 404 });
  if (liveState.status !== "completed" || !liveState.result) {
    return NextResponse.json({ error: "Match has not finished yet." }, { status: 400 });
  }

  try {
    const rawMatch = liveMatchToRawMatch(fixture, liveState);
    archiveMatch(id, rawMatch);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to archive match." }, { status: 400 });
  }

  if (fixture.status !== "Completed") {
    writeFixture({ ...fixture, status: "Completed" });
  }

  return NextResponse.json({ ok: true });
}
