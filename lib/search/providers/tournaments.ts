import { matchesSearch } from "@/lib/cricket/helpers";
import { TOURNAMENT_FORMAT_LABEL, type Tournament } from "@/lib/tournament/types";
import type { SearchProvider, SearchResultItem } from "../types";

const RESULT_LIMIT = 8;

export function createTournamentsProvider(tournaments: Tournament[]): SearchProvider {
  return {
    category: "tournaments",
    search(query: string): SearchResultItem[] {
      if (!query.trim()) return [];
      return tournaments
        .filter((t) => !t.archived && matchesSearch([t.name], query))
        .slice(0, RESULT_LIMIT)
        .map((t) => ({
          id: `tournament:${t.id}`,
          category: "tournaments",
          kind: "navigation",
          title: t.name,
          subtitle: `${TOURNAMENT_FORMAT_LABEL[t.format]} · ${t.status}`,
          href: `/tournaments/${t.id}`,
        }));
    },
  };
}
