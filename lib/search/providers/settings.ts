import { matchesSearch } from "@/lib/cricket/helpers";
import { SETTINGS_SEARCH_INDEX } from "@/lib/settings/search-index";
import { CATEGORY_LABEL, SETTINGS_CATEGORIES } from "@/lib/settings/types";
import type { SearchProvider, SearchResultItem } from "../types";

const RESULT_LIMIT = 8;

// Reuses the exact index Settings Home's own "Search settings" field
// already reads (lib/settings/search-index.ts) -- one search vocabulary
// for the whole app instead of a second copy maintained here.
export function createSettingsProvider(): SearchProvider {
  // No single entry below is literally titled "Settings" (the sub-categories
  // are Profile/Account/Theme/etc.) -- without this, searching the category
  // name itself would find nothing, which is the one query most likely to
  // actually get typed.
  const rootResult: SearchResultItem = {
    id: "settings-root",
    category: "settings",
    kind: "navigation",
    title: "Settings",
    subtitle: "App preferences & configuration",
    href: "/settings",
  };

  const categoryResults: SearchResultItem[] = SETTINGS_CATEGORIES.map((category) => ({
    id: `settings-category:${category}`,
    category: "settings",
    kind: "navigation",
    title: CATEGORY_LABEL[category],
    subtitle: "Settings",
    href: `/settings/${category}`,
  }));

  const fieldResults: SearchResultItem[] = SETTINGS_SEARCH_INDEX.map((entry) => ({
    id: `settings-field:${entry.category}:${entry.label}`,
    category: "settings",
    kind: "navigation",
    title: entry.label,
    subtitle: `Settings · ${CATEGORY_LABEL[entry.category]}`,
    href: `/settings/${entry.category}`,
  }));

  const all = [rootResult, ...categoryResults, ...fieldResults];

  return {
    category: "settings",
    search(query: string): SearchResultItem[] {
      if (!query.trim()) return [];
      return all.filter((item) => matchesSearch([item.title], query)).slice(0, RESULT_LIMIT);
    },
  };
}
