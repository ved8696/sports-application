"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Search, Sparkles, Star, X } from "lucide-react";
import { useSearchUiStore } from "@/lib/store/search-ui-store";
import { useSearchStore } from "@/lib/store/search-store";
import { useCricketStore } from "@/lib/store/cricket-store";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useTournamentStore } from "@/lib/store/tournament-store";
import { runGlobalSearch, totalResultCount } from "@/lib/search/search-engine";
import { createPlayersProvider } from "@/lib/search/providers/players";
import { createTeamsProvider } from "@/lib/search/providers/teams";
import { createTournamentsProvider } from "@/lib/search/providers/tournaments";
import { createMatchesProvider } from "@/lib/search/providers/matches";
import { createReportsProvider } from "@/lib/search/providers/reports";
import { createAnalyticsProvider } from "@/lib/search/providers/analytics";
import { createSettingsProvider } from "@/lib/search/providers/settings";
import { SEARCH_CATEGORIES, SEARCH_CATEGORY_LABEL, FUTURE_COMMANDS, type SearchResultItem } from "@/lib/search/types";
import { PRIMARY_SCREENS } from "@/lib/search/primary-screens";
import { SearchResultCard } from "./search-result-card";
import { cn } from "@/lib/utils";

// Browsable shortcuts, not literal search terms -- "Players" as typed text
// wouldn't match any actual player name, so tapping these navigates
// straight to the section (same idea as the No Results state's Browse
// buttons) instead of running a query that would just come back empty.
const EMPTY_SUGGESTIONS: { label: string; href: string }[] = [
  { label: "Players", href: "/players" },
  { label: "Teams", href: "/teams" },
  { label: "Tournament", href: "/tournaments" },
  { label: "Reports", href: "/tournaments" },
  { label: "Settings", href: "/settings" },
];

export function SearchAiPanel() {
  const router = useRouter();
  const { open, setOpen } = useSearchUiStore();
  const { currentQuery, setQuery, currentFilter, setFilter, recentSearches, commitSearch, clearRecentSearches, pinnedItems, visitCounts, recordVisit } =
    useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const { matches, load: loadMatches } = useCricketStore();
  const { fixtures, load: loadFixtures } = useFixtureStore();
  const { tournaments, load: loadTournaments } = useTournamentStore();

  useEffect(() => {
    if (!open) return;
    loadMatches();
    loadFixtures();
    loadTournaments();
    // Animate-in happens first, then focus once the panel is actually
    // mounted/visible -- a same-tick focus call fires before the enter
    // transition starts and some mobile browsers ignore it.
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [open, loadMatches, loadFixtures, loadTournaments]);

  const providers = useMemo(
    () => [
      createPlayersProvider(matches),
      createTeamsProvider(matches),
      createTournamentsProvider(tournaments),
      createMatchesProvider(fixtures),
      createReportsProvider(tournaments),
      createAnalyticsProvider(),
      createSettingsProvider(),
    ],
    [matches, tournaments, fixtures]
  );

  const groups = useMemo(() => runGlobalSearch(currentQuery, providers), [currentQuery, providers]);
  const visibleGroups = currentFilter === "all" ? groups : groups.filter((g) => g.category === currentFilter);
  const resultCount = totalResultCount(visibleGroups);
  const hasQuery = currentQuery.trim().length > 0;

  const frequentlyVisited = useMemo(
    () =>
      PRIMARY_SCREENS.filter((s) => (visitCounts[s.href] ?? 0) > 0)
        .sort((a, b) => (visitCounts[b.href] ?? 0) - (visitCounts[a.href] ?? 0))
        .slice(0, 4),
    [visitCounts]
  );

  function close() {
    setOpen(false);
    setQuery("");
  }

  function navigate(item: SearchResultItem) {
    if (hasQuery) commitSearch(currentQuery);
    recordVisit(item.href);
    close();
    router.push(item.href);
  }

  function goToScreen(href: string) {
    recordVisit(href);
    close();
    router.push(href);
  }

  function runQuery(text: string) {
    setQuery(text);
    inputRef.current?.focus();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex justify-center bg-black/40"
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full w-full max-w-[480px] flex-col bg-background"
          >
            <div className="flex flex-none items-center gap-2.5 px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2" />
                <input
                  ref={inputRef}
                  value={currentQuery}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search players, teams, tournaments… or ask anything"
                  className="h-11 w-full rounded-full border border-border bg-surface-2 pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-2 focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40"
                />
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
              >
                <X size={16} />
              </button>
            </div>

            {hasQuery && (
              <div className="flex flex-none gap-1.5 overflow-x-auto px-5 pb-3">
                <FilterChip label="All" active={currentFilter === "all"} onClick={() => setFilter("all")} />
                {SEARCH_CATEGORIES.map((c) => (
                  <FilterChip key={c} label={SEARCH_CATEGORY_LABEL[c]} active={currentFilter === c} onClick={() => setFilter(c)} />
                ))}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
              {!hasQuery && (
                <div className="flex flex-col gap-5">
                  <section>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-2">
                      <Sparkles size={11} className="text-wood" /> Try Asking
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {FUTURE_COMMANDS.map((cmd) => (
                        <button
                          key={cmd.id}
                          type="button"
                          onClick={() => runQuery(cmd.label)}
                          className="rounded-xl border border-border px-2.5 py-1.5 text-[11px] font-semibold text-foreground"
                        >
                          {cmd.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  {recentSearches.length > 0 && (
                    <section>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-2">
                          <Clock size={11} /> Recent Searches
                        </p>
                        <button type="button" onClick={clearRecentSearches} className="text-[10px] font-semibold text-muted-2">
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => runQuery(q)}
                            className="rounded-xl border border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {frequentlyVisited.length > 0 && (
                    <section>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">Frequently Visited</p>
                      <div className="flex flex-col gap-2">
                        {frequentlyVisited.map((screen) => {
                          const Icon = screen.icon;
                          return (
                            <button
                              key={screen.id}
                              type="button"
                              onClick={() => goToScreen(screen.href)}
                              className="flex items-center gap-2.5 rounded-xl border border-border p-2.5 text-left"
                            >
                              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] bg-surface-2 text-muted">
                                <Icon size={15} />
                              </span>
                              <span className="text-[12px] font-semibold">{screen.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {pinnedItems.length > 0 && (
                    <section>
                      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-2">
                        <Star size={11} /> Pinned
                      </p>
                      <div className="flex flex-col gap-2">
                        {pinnedItems.map((item) => (
                          <SearchResultCard key={item.id} item={item} onNavigate={navigate} />
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">Try Searching</p>
                    <div className="flex flex-wrap gap-1.5">
                      {EMPTY_SUGGESTIONS.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => goToScreen(s.href)}
                          className="rounded-xl border border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {hasQuery && resultCount === 0 && (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <p className="text-sm font-semibold text-foreground">No matching results.</p>
                  <div className="flex flex-col gap-2 self-stretch">
                    <BrowseButton label="Browse Players" onClick={() => goToScreen("/players")} />
                    <BrowseButton label="Browse Teams" onClick={() => goToScreen("/teams")} />
                    <BrowseButton label="Browse Tournaments" onClick={() => goToScreen("/tournaments")} />
                  </div>
                </div>
              )}

              {hasQuery && resultCount > 0 && (
                <div className="flex flex-col gap-4">
                  {visibleGroups.map((group) => (
                    <section key={group.category}>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">{SEARCH_CATEGORY_LABEL[group.category]}</p>
                      <div className="flex flex-col gap-2">
                        {group.items.map((item) => (
                          <SearchResultCard key={item.id} item={item} onNavigate={navigate} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-none rounded-xl px-2.5 py-1.5 text-[10.5px] font-semibold",
        active ? "bg-foreground text-background" : "border border-border text-muted"
      )}
    >
      {label}
    </button>
  );
}

function BrowseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-xl border border-border py-2.5 text-center text-[12px] font-semibold text-foreground">
      {label}
    </button>
  );
}
