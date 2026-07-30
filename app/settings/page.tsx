"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CategoryContent } from "@/components/settings/category-content";
import { ProfileEditGrid } from "@/components/settings/sections/profile-edit-grid";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useMediaQuery } from "@/lib/store/useMediaQuery";
import { matchesSearch } from "@/lib/cricket/helpers";
import { SETTINGS_SEARCH_INDEX } from "@/lib/settings/search-index";
import { CATEGORY_LABEL, SETTINGS_CATEGORIES, type SettingsCategory } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SettingsHomePage() {
  const { profile, recentChanges, updatePrivacy } = useSettingsStore();
  const [query, setQuery] = useState("");
  const [exported, setExported] = useState(false);
  const isTablet = useMediaQuery("(min-width: 768px)");
  const [selectedCategory, setSelectedCategory] = useState<SettingsCategory>("profile");

  const matchingCategories = useMemo(() => {
    if (!query.trim()) return SETTINGS_CATEGORIES;
    const fromIndex = new Set(
      SETTINGS_SEARCH_INDEX.filter((entry) => matchesSearch([entry.label], query)).map((entry) => entry.category)
    );
    for (const category of SETTINGS_CATEGORIES) {
      if (matchesSearch([CATEGORY_LABEL[category]], query)) fromIndex.add(category);
    }
    return SETTINGS_CATEGORIES.filter((c) => fromIndex.has(c));
  }, [query]);

  function exportData() {
    setExported(true);
    updatePrivacy({}, "Personal data exported");
    setTimeout(() => setExported(false), 2500);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <h1 className="text-lg font-extrabold">Settings</h1>
      </header>

      {isTablet ? (
        <div className="flex min-h-0 flex-1">
          <div className="w-[220px] flex-none overflow-y-auto border-r border-border">
            {SETTINGS_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "block w-full border-l-2 px-4 py-2.5 text-left text-[11px] font-semibold",
                  category === selectedCategory ? "border-foreground bg-surface-2 font-bold text-foreground" : "border-transparent text-muted"
                )}
              >
                {CATEGORY_LABEL[category]}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <h2 className="mb-3.5 text-[15px] font-bold">{CATEGORY_LABEL[selectedCategory]}</h2>
            {selectedCategory === "profile" ? <ProfileEditGrid /> : <CategoryContent category={selectedCategory} />}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <Link href="/settings/profile">
            <Card className="mb-3.5 flex items-center gap-2.5 p-3">
              <div className="h-[42px] w-[42px] flex-none rounded-full bg-surface-3" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold">{profile.name}</p>
                <p className="truncate text-[11px] text-muted-2">{profile.email} · Free Plan</p>
              </div>
              <span className="flex-none text-muted-2">›</span>
            </Card>
          </Link>

          <div className="relative mb-3.5">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search settings" className="pl-10" />
          </div>

          {recentChanges.length > 0 && (
            <div className="mb-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-2">Recently Changed</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {recentChanges.map((change) => (
                  <span key={change.id} className="flex-none rounded-[10px] border border-border px-2.5 py-1.5 text-[10px] font-semibold">
                    {change.label}
                    <span className="ml-1.5 text-muted-2">{timeAgo(change.at)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-2">Quick Actions</p>
            <div className="flex gap-2">
              <Link
                href="/settings/account/change-password"
                className="flex-1 rounded-[10px] border border-border py-2 text-center text-[10px] font-semibold"
              >
                Change Password
              </Link>
              <button
                type="button"
                onClick={exportData}
                className="flex-1 rounded-[10px] border border-border py-2 text-center text-[10px] font-semibold"
              >
                {exported ? "Exported ✓" : "Export Data"}
              </button>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-border">
            {matchingCategories.map((category) => (
              <Link key={category} href={`/settings/${category}`} className="flex items-center justify-between py-3">
                <span className="text-[12px] font-semibold">{CATEGORY_LABEL[category]}</span>
                <span className="text-muted-2">›</span>
              </Link>
            ))}
            {matchingCategories.length === 0 && <p className="py-8 text-center text-xs text-muted">No settings match &quot;{query}&quot;.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
