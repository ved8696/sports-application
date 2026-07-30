"use client";

// Generic helper for any Zustand store created with the `persist` middleware
// (lib/store/match-creation-store.ts, lib/store/match-setup-store.ts): tells
// callers whether that store has finished reading its persisted snapshot
// back out of storage.
//
// Root cause this exists to fix: zustand's persist middleware always
// rehydrates asynchronously -- even for a synchronous engine like
// sessionStorage -- so a component's first render (and any effect that runs
// on mount) sees the store's default/empty state, not the persisted one.
// Any logic that depends on persisted data being present (e.g. the wizard
// step guards in lib/matchSetup/validation.ts and
// lib/matchCreation/validation.ts, which redirect back to step 1 when
// required fields look empty) must wait for hydration to actually finish, or
// it will race the real data and incorrectly act on the store's defaults.
//
// Uses useSyncExternalStore (React's canonical primitive for subscribing to
// state that lives outside React) against the store's own
// `persist.hasHydrated()` / `persist.onFinishHydration()` API -- no polling,
// no timeouts, no changes to the stores themselves.

import { useSyncExternalStore } from "react";

interface PersistApi<T> {
  hasHydrated: () => boolean;
  onFinishHydration: (listener: (state: T) => void) => () => void;
}

const getServerSnapshot = () => false;

export function useHasHydrated<T>(persistApi: PersistApi<T>): boolean {
  return useSyncExternalStore(
    (onStoreChange) => persistApi.onFinishHydration(() => onStoreChange()),
    () => persistApi.hasHydrated(),
    getServerSnapshot
  );
}
