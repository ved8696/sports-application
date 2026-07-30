"use client";

import { useSyncExternalStore } from "react";

// Used only by the Settings module to switch between push-navigation (phone)
// and the master-detail split (tablet+) the design calls for. No other
// module in the app varies layout by viewport, so this stays scoped here
// rather than becoming a global layout primitive.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
