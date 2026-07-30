import { matchesSearch } from "@/lib/cricket/helpers";
import type { Fixture } from "@/lib/cricket/fixture-types";
import type { SearchProvider, SearchResultItem } from "../types";

const RESULT_LIMIT = 8;

// Same status -> destination mapping components/tournament/fixture-card.tsx
// uses -- a fixture's "detail" screen depends on how far its match has
// progressed, so search results should land wherever that card would.
function hrefForFixture(fixture: Fixture): string {
  if (fixture.status === "Live") return `/matches/${fixture.id}/live`;
  if (fixture.status === "Completed") return `/matches/${fixture.id}/scorecard`;
  return `/matches/${fixture.id}`;
}

export function createMatchesProvider(fixtures: Fixture[]): SearchProvider {
  return {
    category: "matches",
    search(query: string): SearchResultItem[] {
      if (!query.trim()) return [];
      return fixtures
        .filter((f) => matchesSearch([f.name, f.teams?.[0]?.name ?? "", f.teams?.[1]?.name ?? ""], query))
        .slice(0, RESULT_LIMIT)
        .map((f) => ({
          id: `match:${f.id}`,
          category: "matches",
          kind: "navigation",
          title: f.name,
          subtitle: `${f.venue.name} · ${f.status}`,
          href: hrefForFixture(f),
        }));
    },
  };
}
