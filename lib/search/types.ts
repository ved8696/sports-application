// Core Search & AI Command Center domain model. Phase 1 only implements
// literal keyword search, but every shape here is written so a later "ask
// anything" phase can slot in without touching the panel UI -- see
// ai-types.ts for the (currently unused) natural-language surface, and
// SearchResultItem.kind below for how a single result list can already mix
// plain navigation results with future AI-suggested actions.

import { BarChart3, FileBarChart, Settings as SettingsIcon, Shield, Swords, Trophy, Users, type LucideIcon } from "lucide-react";

export const SEARCH_CATEGORIES = ["players", "teams", "tournaments", "matches", "reports", "analytics", "settings"] as const;
export type SearchCategory = (typeof SEARCH_CATEGORIES)[number];

export const SEARCH_CATEGORY_LABEL: Record<SearchCategory, string> = {
  players: "Players",
  teams: "Teams",
  tournaments: "Tournaments",
  matches: "Matches",
  reports: "Reports",
  analytics: "Analytics",
  settings: "Settings",
};

/** Icons are resolved from `category` at render time (see SearchResultCard)
 * rather than carried as a component reference on the item itself -- a
 * LucideIcon is a forwardRef object, which JSON.stringify silently mangles
 * into `{}` the moment anything holding one round-trips through the
 * localStorage-persisted pinned-items store. One lookup here keeps every
 * result's icon renderable whether it just came out of a provider or back
 * out of persisted storage. */
export const SEARCH_CATEGORY_ICON: Record<SearchCategory, LucideIcon> = {
  players: Users,
  teams: Shield,
  tournaments: Trophy,
  matches: Swords,
  reports: FileBarChart,
  analytics: BarChart3,
  settings: SettingsIcon,
};

/** A single row in the results list. `kind` distinguishes an ordinary
 * navigation hit from a future AI-suggested action so the same list/card
 * component can render both without a redesign once Phase 2 lands. Plain
 * data only (JSON-serializable) -- see SEARCH_CATEGORY_ICON for why there's
 * no icon field here. */
export interface SearchResultItem {
  id: string;
  category: SearchCategory;
  kind: "navigation" | "suggested-action";
  title: string;
  subtitle: string;
  href: string;
}

/** One category's contribution to a query -- the unit a SearchProvider
 * returns and the aggregator groups by. */
export type SearchResultGroup = {
  category: SearchCategory;
  items: SearchResultItem[];
};

/** A Search Provider owns exactly one category and knows how to turn a
 * query into results for it. New categories (or a future provider backed by
 * an API instead of local stores) register here without the aggregator,
 * panel, or store needing to change -- the plugin point the brief asks for. */
export interface SearchProvider {
  category: SearchCategory;
  search(query: string): SearchResultItem[];
}

/** Static example prompt / future command shown under the input and in the
 * empty state. `runnable` ones execute through the exact same search
 * pipeline as anything the user types (fills the query, no bespoke logic
 * per command); the rest are labelled placeholders for capabilities that
 * don't exist yet (comparison, generation) -- listed per the brief, not
 * wired to anything. */
export interface CommandDefinition {
  id: string;
  label: string;
  runnable: boolean;
}

export const FUTURE_COMMANDS: CommandDefinition[] = [
  { id: "create-tournament", label: "Create a tournament", runnable: true },
  { id: "open-tournament", label: "Open Mumbai Premier League", runnable: true },
  { id: "find-player", label: "Find Virat Sharma", runnable: true },
  { id: "show-live", label: "Show live matches", runnable: true },
  { id: "generate-report", label: "Generate tournament report", runnable: false },
  { id: "compare-players", label: "Compare two players", runnable: false },
  { id: "open-settings", label: "Open Settings", runnable: true },
];
