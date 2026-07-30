import { matchesSearch } from "@/lib/cricket/helpers";
import type { Match } from "@/lib/cricket/types";
import type { SearchProvider, SearchResultItem } from "../types";

const RESULT_LIMIT = 8;

// Historical Cricsheet data is the only real player roster the app has
// (there's no dedicated player-profile store) -- same source
// lib/matchSetup/roster.ts already reads for squad suggestions.
function allPlayerNames(matches: Match[]): string[] {
  const names = new Set<string>();
  for (const match of matches) {
    for (const roster of Object.values(match.players)) {
      roster.forEach((name) => names.add(name));
    }
  }
  return Array.from(names);
}

export function createPlayersProvider(matches: Match[]): SearchProvider {
  const names = allPlayerNames(matches);
  return {
    category: "players",
    search(query: string): SearchResultItem[] {
      if (!query.trim()) return [];
      return names
        .filter((name) => matchesSearch([name], query))
        .slice(0, RESULT_LIMIT)
        .map((name) => ({
          id: `player:${name}`,
          category: "players",
          kind: "navigation",
          title: name,
          subtitle: "Player",
          href: "/players",
        }));
    },
  };
}
