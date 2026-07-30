import { extractFilterOptions } from "@/lib/cricket/filters";
import { matchesSearch } from "@/lib/cricket/helpers";
import type { Match } from "@/lib/cricket/types";
import type { SearchProvider, SearchResultItem } from "../types";

const RESULT_LIMIT = 8;

export function createTeamsProvider(matches: Match[]): SearchProvider {
  const teams = extractFilterOptions(matches, {}).teams;
  return {
    category: "teams",
    search(query: string): SearchResultItem[] {
      if (!query.trim()) return [];
      return teams
        .filter((name) => matchesSearch([name], query))
        .slice(0, RESULT_LIMIT)
        .map((name) => ({
          id: `team:${name}`,
          category: "teams",
          kind: "navigation",
          title: name,
          subtitle: "Team",
          href: "/teams",
        }));
    },
  };
}
