import type { SearchProvider, SearchResultGroup } from "./types";

/** Runs every registered provider against a query and groups non-empty
 * results by category. Adding a category (or swapping a provider's data
 * source for a real API later) never touches this function -- it only
 * knows the SearchProvider contract. */
export function runGlobalSearch(query: string, providers: SearchProvider[]): SearchResultGroup[] {
  return providers
    .map((provider) => ({ category: provider.category, items: provider.search(query) }))
    .filter((group) => group.items.length > 0);
}

export function totalResultCount(groups: SearchResultGroup[]): number {
  return groups.reduce((sum, g) => sum + g.items.length, 0);
}
