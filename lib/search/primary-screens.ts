import { BarChart3, FileBarChart, Home, Settings as SettingsIcon, Shield, Swords, Trophy, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PrimaryScreen {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

// The canonical "primary screens" list the brief names for the top-bar icon
// (Dashboard, Players, Teams, Tournament Management, Match Management, Live
// Scoring, Analytics, Reports, Settings) -- shared by the visit tracker
// (what counts as a trackable page) and the panel's Frequently Visited /
// Browse shortcuts, so both stay in sync with exactly one list.
export const PRIMARY_SCREENS: PrimaryScreen[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
  { id: "players", label: "Players", href: "/players", icon: Users },
  { id: "teams", label: "Teams", href: "/teams", icon: Shield },
  { id: "tournaments", label: "Tournaments", href: "/tournaments", icon: Trophy },
  { id: "matches", label: "Matches", href: "/matches", icon: Swords },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
  { id: "reports", label: "Reports", href: "/tournaments", icon: FileBarChart },
  { id: "settings", label: "Settings", href: "/settings", icon: SettingsIcon },
];
