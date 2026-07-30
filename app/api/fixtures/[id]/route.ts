import { NextResponse } from "next/server";
import type { Fixture, FixturePatch, FixturePlayingXI, FixtureTeam, FixtureToss } from "@/lib/cricket/fixture-types";
import { readFixture, writeFixture } from "@/lib/server/fixtures-repo";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fixture = readFixture(id);
  if (!fixture) return NextResponse.json({ error: "Match not found." }, { status: 404 });
  return NextResponse.json({ fixture });
}

function isValidTeams(teams: unknown): teams is [FixtureTeam, FixtureTeam] {
  if (!Array.isArray(teams) || teams.length !== 2) return false;
  const [a, b] = teams as Partial<FixtureTeam>[];
  const validTeam = (t: Partial<FixtureTeam> | undefined) =>
    Boolean(t?.name?.trim() && Array.isArray(t.squad) && t.squad.every((p) => typeof p === "string" && p.trim()));
  return validTeam(a) && validTeam(b) && a.name!.trim() !== b.name!.trim();
}

function isValidPlayingXI(xi: unknown): xi is [FixturePlayingXI, FixturePlayingXI] {
  if (!Array.isArray(xi) || xi.length !== 2) return false;
  return (xi as Partial<FixturePlayingXI>[]).every((entry) => {
    if (!entry?.team?.trim() || !Array.isArray(entry.players)) return false;
    const players = entry.players as unknown[];
    if (players.length !== 11 || !players.every((p) => typeof p === "string" && p.trim())) return false;
    if (new Set(players).size !== 11) return false;
    if (!entry.captain || !players.includes(entry.captain)) return false;
    if (!entry.wicketKeeper || !players.includes(entry.wicketKeeper)) return false;
    if (entry.viceCaptain && (!players.includes(entry.viceCaptain) || entry.viceCaptain === entry.captain)) return false;
    return true;
  });
}

function isValidToss(toss: unknown): toss is FixtureToss {
  if (!toss || typeof toss !== "object") return false;
  const t = toss as Partial<FixtureToss>;
  return Boolean(t.winner?.trim()) && (t.decision === "bat" || t.decision === "bowl");
}

function isValidStatus(status: unknown): status is Fixture["status"] {
  return status === "Scheduled" || status === "Live";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = readFixture(id);
  if (!existing) return NextResponse.json({ error: "Match not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid patch body." }, { status: 400 });
  }

  const patch = body as FixturePatch;
  const next: Fixture = { ...existing };

  if ("teams" in patch) {
    if (!isValidTeams(patch.teams)) return NextResponse.json({ error: "Invalid teams." }, { status: 400 });
    next.teams = patch.teams;
  }
  if ("playingXI" in patch) {
    if (!isValidPlayingXI(patch.playingXI)) return NextResponse.json({ error: "Invalid playing XI." }, { status: 400 });
    next.playingXI = patch.playingXI;
  }
  if ("toss" in patch) {
    if (!isValidToss(patch.toss)) return NextResponse.json({ error: "Invalid toss." }, { status: 400 });
    next.toss = patch.toss;
  }
  if ("status" in patch) {
    if (!isValidStatus(patch.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    next.status = patch.status;
  }

  writeFixture(next);
  return NextResponse.json({ fixture: next });
}
