"use client";

import { useEffect } from "react";

// Only the Settings module gets the wider tablet frame (app/globals.css's
// #app[data-wide="true"] rule) -- every other route keeps the phone-width
// shell. Toggled via an attribute rather than a prop since #app is rendered
// by the root layout, outside this subtree.
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const app = document.getElementById("app");
    app?.setAttribute("data-wide", "true");
    return () => {
      app?.removeAttribute("data-wide");
    };
  }, []);

  return <>{children}</>;
}
