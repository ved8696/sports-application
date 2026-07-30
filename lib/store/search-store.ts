"use client";

// State for the Search & AI Command Center: recent/pinned/history persist
// across sessions (localStorage, same reasoning as lib/store/settings-store.ts);
// currentQuery/currentFilter are live UI state but kept in the store rather
// than component state so a future AI panel reading "what was just searched"
// doesn't need prop-drilling from wherever the button was tapped.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SearchCategory, SearchResultItem } from "@/lib/search/types";

const RECENT_SEARCHES_LIMIT = 8;
const SEARCH_HISTORY_LIMIT = 50;
const PINNED_ITEMS_LIMIT = 20;

interface SearchHistoryEntry {
  query: string;
  at: string;
}

interface SearchState {
  recentSearches: string[];
  searchHistory: SearchHistoryEntry[];
  pinnedItems: SearchResultItem[];
  visitCounts: Record<string, number>;
  currentQuery: string;
  currentFilter: SearchCategory | "all";

  setQuery: (query: string) => void;
  setFilter: (filter: SearchCategory | "all") => void;
  commitSearch: (query: string) => void;
  clearRecentSearches: () => void;
  togglePinned: (item: SearchResultItem) => void;
  isPinned: (id: string) => boolean;
  recordVisit: (path: string) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      searchHistory: [],
      pinnedItems: [],
      visitCounts: {},
      currentQuery: "",
      currentFilter: "all",

      setQuery: (query) => set({ currentQuery: query }),
      setFilter: (filter) => set({ currentFilter: filter }),

      commitSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((s) => ({
          recentSearches: [trimmed, ...s.recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(
            0,
            RECENT_SEARCHES_LIMIT
          ),
          searchHistory: [{ query: trimmed, at: new Date().toISOString() }, ...s.searchHistory].slice(0, SEARCH_HISTORY_LIMIT),
        }));
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      togglePinned: (item) =>
        set((s) => {
          const exists = s.pinnedItems.some((p) => p.id === item.id);
          return {
            pinnedItems: exists ? s.pinnedItems.filter((p) => p.id !== item.id) : [item, ...s.pinnedItems].slice(0, PINNED_ITEMS_LIMIT),
          };
        }),

      isPinned: (id) => get().pinnedItems.some((p) => p.id === id),

      recordVisit: (path) => set((s) => ({ visitCounts: { ...s.visitCounts, [path]: (s.visitCounts[path] ?? 0) + 1 } })),
    }),
    {
      name: "willow-search",
      storage: createJSONStorage(() => localStorage),
      // currentQuery/currentFilter are transient UI state, not history --
      // excluded so reopening the panel in a new session starts fresh.
      partialize: (s) => ({
        recentSearches: s.recentSearches,
        searchHistory: s.searchHistory,
        pinnedItems: s.pinnedItems,
        visitCounts: s.visitCounts,
      }),
    }
  )
);
