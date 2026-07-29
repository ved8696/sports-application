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

// Routes that render full-bleed without the tab bar (auth flow, not yet a
// destination this sprint touches).
const HIDDEN_ON = ["/login", "/"];

export function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

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
