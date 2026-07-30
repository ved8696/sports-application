import { NextResponse } from "next/server";
import type { Tournament, TournamentDraft } from "@/lib/tournament/types";
import { listTournaments, writeTournament } from "@/lib/server/tournaments-repo";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ tournaments: listTournaments() });
}

function isValidDraft(body: unknown): body is TournamentDraft {
  if (!body || typeof body !== "object") return false;
  const d = body as Partial<TournamentDraft>;
  return Boolean(
    d.name?.trim() &&
      d.startDate &&
      d.endDate &&
      d.format &&
      typeof d.numberOfTeams === "number" &&
      d.rules &&
      Array.isArray(d.teams) &&
      d.teams.length >= 2
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
    return NextResponse.json({ error: "Missing required tournament details." }, { status: 400 });
  }

  const tournament: Tournament = {
    ...body,
    id: `tournament-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    status: "Draft",
    archived: false,
    fixturesGenerated: false,
  };

  writeTournament(tournament);

  return NextResponse.json({ tournament }, { status: 201 });
}
