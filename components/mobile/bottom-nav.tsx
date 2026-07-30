"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Swords, CircleDot, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: Swords },
  { href: "/score", label: "Score", icon: CircleDot },
  { href: "/players", label: "Players", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

// Routes that render full-bleed without the tab bar (auth flow, plus the
// match-creation wizard, pre-match setup wizard, and live scoring screen --
// each has its own sticky footer that shouldn't stack on top of the tab bar).
const HIDDEN_ON = ["/login", "/"];
const HIDDEN_PREFIXES = ["/matches/new", "/tournaments/new"];
const SETUP_WIZARD_RE = /^\/matches\/[^/]+\/setup(\/|$)/;
const LIVE_SCORING_RE = /^\/matches\/[^/]+\/live(\/|$)/;
const TOURNAMENT_TRANSITION_RE = /^\/tournaments\/[^/]+\/(created|complete)(\/|$)/;

export function BottomNav() {
  const pathname = usePathname();
  if (
    HIDDEN_ON.includes(pathname) ||
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    SETUP_WIZARD_RE.test(pathname) ||
    LIVE_SCORING_RE.test(pathname) ||
    TOURNAMENT_TRANSITION_RE.test(pathname)
  ) {
    return null;
  }

  return (
    <nav
      className="flex flex-none items-center justify-around border-t border-white/[0.06] bg-[#0d0d0d]/90 backdrop-blur-md px-2 pt-2"
      style={{ paddingBottom: "calc(var(--safe-bottom) + 10px)" }}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex w-[58px] flex-col items-center gap-1 rounded-lg py-1 text-muted-2 transition-colors",
              active && "text-blue"
            )}
          >
            <Icon size={19} strokeWidth={2} />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
