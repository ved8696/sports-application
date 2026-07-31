"use client";

// The Match Centre list shows real score/overs for every currently-live
// fixture, but lib/store/live-scoring-store.ts is intentionally a
// single-match store (it's what the scorer/spectator screens for ONE match
// key off). Rather than reshape that store into a multi-match cache just for
// this list -- a small, contained view-local fetch is the narrower change:
// batch-fetch /api/live/[id] for whichever fixtures are currently "Live"
// (in practice a small number at once) and cache the snapshots here.

import { useEffect, useState } from "react";
import type { LiveMatchState } from "@/lib/liveScoring/types";

export function useLiveSnapshots(liveFixtureIds: string[]): Record<string, LiveMatchState> {
  const [snapshots, setSnapshots] = useState<Record<string, LiveMatchState>>({});
  const key = liveFixtureIds.slice().sort().join(",");

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    const ids = key.split(",");
    Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/live/${id}`);
          if (!res.ok) return null;
          const { state }: { state: LiveMatchState } = await res.json();
          return [id, state] as const;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, LiveMatchState> = {};
      for (const r of results) if (r) next[r[0]] = r[1];
      setSnapshots(next);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return snapshots;
}
