import { matchesSearch } from "@/lib/cricket/helpers";
import type { SearchProvider, SearchResultItem } from "../types";

// Analytics is a single global page (no per-entity sub-screens), so this
// provider has exactly one candidate result rather than a list to filter.
const ANALYTICS_KEYWORDS = ["analytics", "stats", "statistics", "charts", "kpis", "run rate", "boundary", "dashboard analytics"];

export function createAnalyticsProvider(): SearchProvider {
  return {
    category: "analytics",
    search(query: string): SearchResultItem[] {
      if (!query.trim() || !matchesSearch(ANALYTICS_KEYWORDS, query)) return [];
      const result: SearchResultItem = {
        id: "analytics:dashboard",
        category: "analytics",
        kind: "navigation",
        title: "Analytics Dashboard",
        subtitle: "Deep-dive stats across every tracked match",
        href: "/analytics",
      };
      return [result];
    },
  };
}
