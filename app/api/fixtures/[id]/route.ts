import "server-only";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import type { Fixture } from "@/lib/cricket/fixture-types";

export const dynamic = "force-dynamic";

const FIXTURES_DIR = path.join(process.cwd(), "data", "fixtures");

// Fixture ids are always server-generated as "fixture-<uuid>" (see
// app/api/fixtures/route.ts). Validating the shape before it touches the
// filesystem path closes off path traversal via a crafted id segment.
const FIXTURE_ID_RE = /^fixture-[0-9a-fA-F-]+$/;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!FIXTURE_ID_RE.test(id)) {
    return NextResponse.json({ error: "Match not found." }, { status: 404 });
  }

  const filePath = path.join(FIXTURES_DIR, `${id}.json`);
  try {
    const fixture = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Fixture;
    return NextResponse.json({ fixture });
  } catch {
    return NextResponse.json({ error: "Match not found." }, { status: 404 });
  }
}
