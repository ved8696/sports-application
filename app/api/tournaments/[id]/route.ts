import { NextResponse } from "next/server";
import type { Tournament, TournamentPatch } from "@/lib/tournament/types";
import { deleteTournament, readTournament, writeTournament } from "@/lib/server/tournaments-repo";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = readTournament(id);
  if (!tournament) return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
  return NextResponse.json({ tournament });
}

function isValidStatus(status: unknown): status is Tournament["status"] {
  return status === "Draft" || status === "Active" || status === "Completed";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = readTournament(id);
  if (!existing) return NextResponse.json({ error: "Tournament not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid patch body." }, { status: 400 });
  }

  const patch = body as TournamentPatch;
  if ("status" in patch && !isValidStatus(patch.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const next: Tournament = { ...existing, ...patch, id: existing.id, createdAt: existing.createdAt };
  writeTournament(next);
  return NextResponse.json({ tournament: next });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = readTournament(id);
  if (!existing) return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
  deleteTournament(id);
  return NextResponse.json({ ok: true });
}
