// Architecture placeholders for the AI phase of the Command Center. Nothing
// in this file is wired to real logic yet -- these interfaces exist purely
// so the panel's data flow (query in, results/messages out) already has a
// shape to grow into, and so Phase 2 is additive (new provider + new
// renderer branch) rather than a rebuild. Do not implement against these
// until AI is actually in scope.

import type { SearchResultItem } from "./types";

/** A free-text query the literal search pipeline couldn't resolve to
 * results would eventually be handed to an AI provider as one of these. */
export interface NaturalLanguageQuery {
  raw: string;
  intent?: string;
}

/** What an AI turn would suggest doing next -- the eventual superset of
 * FUTURE_COMMANDS once actions can be inferred from free text instead of
 * only offered as static examples. */
export interface SuggestedAction {
  id: string;
  label: string;
  description?: string;
  run: () => void;
}

/** One turn in a persisted back-and-forth. `results` lets an assistant
 * reply embed real SearchResultItem cards inline, reusing the same result
 * card the plain-search list already renders. */
export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  results?: SearchResultItem[];
  createdAt: string;
}

/** Incremental delivery for an assistant reply that's still being
 * generated -- the panel would append `delta` to the in-progress message
 * and flip to "done" on completion. */
export interface StreamingResponseChunk {
  messageId: string;
  delta: string;
  done: boolean;
}

/** A backend/tool call an assistant turn might trigger (e.g. "create
 * tournament" actually executing). Modeled after the shape of a real
 * function-call result so wiring one in later doesn't change this type. */
export interface ToolExecutionRequest {
  id: string;
  tool: string;
  args: Record<string, unknown>;
}

export interface ToolExecutionResult {
  requestId: string;
  status: "pending" | "success" | "error";
  output?: unknown;
  error?: string;
}
