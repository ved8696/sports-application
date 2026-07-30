// Export architecture for a completed match. JSON export is fully
// implemented (client-side blob download, no new dependency). PDF export is
// architecture-only per this sprint's brief -- the interface is real and
// stable so a future sprint can implement it against a real PDF service
// without changing any call site.

import type { LiveMatchState } from "./types";

export function exportMatchAsJson(state: LiveMatchState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.fixtureId}-scorecard.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildShareUrl(fixtureId: string): string {
  if (typeof window === "undefined") return `/matches/${fixtureId}/scorecard`;
  return `${window.location.origin}/matches/${fixtureId}/scorecard`;
}

export async function copyShareLink(fixtureId: string): Promise<void> {
  await navigator.clipboard.writeText(buildShareUrl(fixtureId));
}

/** Architecture only -- no PDF rendering service is wired up yet. */
export async function exportScorecardPdf(): Promise<Blob> {
  throw new Error("PDF export is not implemented yet -- architecture-only extension point for a future sprint.");
}
