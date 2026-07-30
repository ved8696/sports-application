// Future AI Hooks -- extension points only. No implementation, no AI/ML
// dependency introduced. Each interface takes the same LiveMatchState/
// BallEvent shapes the rest of lib/liveScoring already uses, so a future
// sprint can implement one of these against real data without touching the
// engine, store, or UI. Calling the no-op defaults is always safe: they
// resolve to an empty/disabled result rather than throwing, so wiring one in
// early (e.g. a "Highlights" button that's disabled today) doesn't require
// a second pass later.

import type { BallEvent, LiveMatchState } from "./types";

export interface VideoSyncProvider {
  /** Maps a ball event to a playable video timestamp/clip, once footage exists. */
  getClipForEvent(event: BallEvent): Promise<{ clipUrl: string; startSeconds: number } | null>;
}

export interface BallTaggingProvider {
  /** Attaches structured tags (line/length/shot area, etc.) to a delivery. */
  getTagsForEvent(event: BallEvent): Promise<Record<string, string>>;
}

export interface ShotClassificationProvider {
  /** Classifies the batting shot played on a delivery, if any. */
  classifyShot(event: BallEvent): Promise<{ shotType: string; confidence: number } | null>;
}

export interface HighlightGenerator {
  /** Selects and orders the events that should make up an auto-generated highlights reel. */
  generateHighlights(state: LiveMatchState): Promise<BallEvent[]>;
}

export interface BroadcastGraphicsProvider {
  /** Produces a broadcast-ready overlay payload (lower-third score bug, etc.) for the current state. */
  getOverlayPayload(state: LiveMatchState): Promise<Record<string, unknown>>;
}

export interface PerformanceAnalyticsProvider {
  /** Deeper, model-driven performance insight for a player beyond the deterministic POTM formula in potm.ts. */
  getPlayerInsight(state: LiveMatchState, playerName: string): Promise<Record<string, unknown>>;
}

export interface CoachingReportProvider {
  /** Generates a coaching-focused writeup for a team from the completed match. */
  generateReport(state: LiveMatchState, team: string): Promise<string>;
}

const notYetAvailable = <T>(): Promise<T> => Promise.reject(new Error("Not implemented -- extension point for a future sprint."));

/** Safe no-op defaults: every method resolves to "nothing available" rather than throwing, so UI can wire against these today. */
export const noopAiHooks: {
  video: VideoSyncProvider;
  tagging: BallTaggingProvider;
  shotClassification: ShotClassificationProvider;
  highlights: HighlightGenerator;
  broadcast: BroadcastGraphicsProvider;
  performance: PerformanceAnalyticsProvider;
  coaching: CoachingReportProvider;
} = {
  video: { getClipForEvent: async () => null },
  tagging: { getTagsForEvent: async () => ({}) },
  shotClassification: { classifyShot: async () => null },
  highlights: { generateHighlights: async () => [] },
  broadcast: { getOverlayPayload: async () => ({}) },
  performance: { getPlayerInsight: () => notYetAvailable() },
  coaching: { generateReport: () => notYetAvailable() },
};
