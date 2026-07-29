import "server-only";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

// Real activity derived from the /data directory's own filesystem metadata --
// there is no activity log/audit trail in this project, so rather than
// fabricate entries, this surfaces the one thing that's actually true: which
// match files exist and when they last changed on disk.
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");

export interface ActivityEntry {
  file: string;
  matchId: string;
  modifiedAt: string;
}

export async function GET() {
  let entries: ActivityEntry[] = [];
  try {
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.toLowerCase().endsWith(".json"));
    entries = files
      .map((file) => {
        const stat = fs.statSync(path.join(DATA_DIR, file));
        return { file, matchId: file.replace(/\.json$/i, ""), modifiedAt: stat.mtime.toISOString() };
      })
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
      .slice(0, 6);
  } catch {
    entries = [];
  }
  return NextResponse.json({ entries });
}
