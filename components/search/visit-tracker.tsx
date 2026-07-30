"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSearchStore } from "@/lib/store/search-store";
import { PRIMARY_SCREENS } from "@/lib/search/primary-screens";

// Feeds the panel's "Frequently Visited" section -- mounted once at the
// root layout, increments a per-path counter whenever the route matches one
// of the app's primary screens. Deliberately narrow (exact-match against a
// known list) rather than counting every route, so a detail page like
// /matches/fixture-abc123 doesn't pollute counts for "Matches".
export function VisitTracker() {
  const pathname = usePathname();
  const recordVisit = useSearchStore((s) => s.recordVisit);

  useEffect(() => {
    if (PRIMARY_SCREENS.some((screen) => screen.href === pathname)) {
      recordVisit(pathname);
    }
  }, [pathname, recordVisit]);

  return null;
}
