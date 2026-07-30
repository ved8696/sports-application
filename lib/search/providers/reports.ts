import { matchesSearch } from "@/lib/cricket/helpers";
import type { Tournament } from "@/lib/tournament/types";
import type { SearchProvider, SearchResultItem } from "../types";

const RESULT_LIMIT = 8;

// The only Reports screens that exist today are per-tournament
// (app/tournaments/[id]/reports) -- there's no standalone global Reports
// route yet, so results are that page for each tournament matching the
// query either by name or by the word "report" itself.
export function createReportsProvider(tournaments: Tournament[]): SearchProvider {
  return {
    category: "reports",
    search(query: string): SearchResultItem[] {
      if (!query.trim()) return [];
      return tournaments
        .filter((t) => !t.archived && matchesSearch([t.name, "reports", "report"], query))
        .slice(0, RESULT_LIMIT)
        .map((t) => ({
          id: `report:${t.id}`,
          category: "reports",
          kind: "navigation",
          title: `${t.name} Reports`,
          subtitle: "Tournament Summary · Top Performers · Champion",
          href: `/tournaments/${t.id}/reports`,
        }));
    },
  };
}
