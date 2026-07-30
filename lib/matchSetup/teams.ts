// Team-picker option lists, derived live from loaded match history -- same
// pattern as lib/cricket/filters.ts's extractFilterOptions: nothing here is
// hardcoded, a category with no data simply produces no section.

import type { Match } from "@/lib/cricket/types";

export interface TeamGroup {
  label: string;
  teams: string[];
}

export function recentTeamNames(matches: Pick<Match, "teams" | "dates">[], limit = 6): string[] {
  const latest = new Map<string, string>();
  for (const match of matches) {
    const date = match.dates[0] ?? "";
    for (const name of match.teams) {
      if (!name) continue;
      if (!latest.has(name) || date > (latest.get(name) as string)) latest.set(name, date);
    }
  }
  return Array.from(latest.entries())
    .sort((a, b) => b[1].localeCompare(a[1]))
    .slice(0, limit)
    .map(([name]) => name);
}

/** Groups every team seen in history by its Cricsheet team_type (international/club/domestic/...). */
export function teamGroups(matches: Match[]): TeamGroup[] {
  const typeByTeam = new Map<string, string>();
  for (const match of matches) {
    for (const name of match.teams) {
      if (name && !typeByTeam.has(name)) typeByTeam.set(name, match.teamType);
    }
  }
  const byType = new Map<string, string[]>();
  for (const [name, type] of typeByTeam) {
    const label = `${type.charAt(0).toUpperCase()}${type.slice(1)} Teams`;
    const list = byType.get(label) ?? [];
    list.push(name);
    byType.set(label, list);
  }
  return Array.from(byType.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, teams]) => ({ label, teams: teams.sort((a, b) => a.localeCompare(b)) }));
}
