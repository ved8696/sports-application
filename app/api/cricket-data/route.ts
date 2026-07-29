import { NextResponse } from "next/server";
import { loadCricketData } from "@/lib/cricket/dataLoader";

// Always re-read /data so newly added JSON files show up without a rebuild.
export const dynamic = "force-dynamic";

export async function GET() {
  const { matches, playerBios, warnings } = loadCricketData();
  if (warnings.length > 0) {
    console.warn("[cricket-data]", warnings.join("; "));
  }
  return NextResponse.json({ matches, playerBios });
}
