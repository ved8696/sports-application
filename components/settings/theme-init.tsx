"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useHasHydrated } from "@/lib/store/useHasHydrated";
import { useMediaQuery } from "@/lib/store/useMediaQuery";

const THEME_COLOR: Record<"dark" | "light", string> = {
  dark: "#050505",
  light: "#f5f3ee",
};

// Applies the persisted Appearance theme to <html> once the settings store
// has actually hydrated from localStorage -- gating on hasHydrated matters
// for the same reason it does for the wizard stores: reacting to the
// store's default value before hydration completes would flash the app
// back to "dark" for an instant, undoing the blocking inline script in
// app/layout.tsx that already set it correctly. "System" also stays live
// after mount via a matchMedia listener, so toggling the OS theme while the
// app is open updates immediately.
export function ThemeInit() {
  const theme = useSettingsStore((s) => s.appearance.theme);
  const hasHydrated = useHasHydrated(useSettingsStore.persist);
  const systemPrefersLight = useMediaQuery("(prefers-color-scheme: light)");

  useEffect(() => {
    if (!hasHydrated) return;
    const resolved = theme === "system" ? (systemPrefersLight ? "light" : "dark") : theme;
    document.documentElement.dataset.theme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[resolved]);
  }, [theme, hasHydrated, systemPrefersLight]);

  return null;
}
