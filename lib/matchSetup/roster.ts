// Squad candidates are seeded from real historical rosters in /data (the same
// Match.players map the desktop app's own types already expose) -- never
// fabricated. A brand-new team simply starts with an empty candidate list and
// the user adds players manually in Squad Management.

import type { Match } from "@/lib/cricket/types";

export function teamRoster(matches: Match[], teamName: string): string[] {
  const set = new Set<string>();
  for (const match of matches) {
    const players = match.players[teamName];
    if (players) players.forEach((p) => set.add(p));
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
