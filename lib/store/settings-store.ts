"use client";

// Single preferences store backing every Settings category. Persisted to
// localStorage (a user preference, not in-progress session data -- same
// reasoning as the wizard drafts using sessionStorage instead). Every
// mutation also appends to `recentChanges`, which is what Settings Home's
// "Recently Changed" strip reads -- capped at the 5 most recent so it stays
// a quick-glance list, not a full audit log.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AccountSettings,
  AppConfigSettings,
  AppearanceSettings,
  CricketPreferences,
  NotificationSettings,
  PreferencesSettings,
  PrivacySettings,
  ProfileFields,
  RecentChange,
  StorageSettings,
} from "@/lib/settings/types";

const RECENT_CHANGES_LIMIT = 5;

interface SettingsState {
  profile: ProfileFields;
  account: AccountSettings;
  preferences: PreferencesSettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  cricket: CricketPreferences;
  privacy: PrivacySettings;
  storage: StorageSettings;
  appConfig: AppConfigSettings;
  recentChanges: RecentChange[];

  updateProfile: (patch: Partial<ProfileFields>, changeLabel: string) => void;
  updateAccount: (patch: Partial<AccountSettings>, changeLabel: string) => void;
  updatePreferences: (patch: Partial<PreferencesSettings>, changeLabel: string) => void;
  updateNotifications: (patch: Partial<NotificationSettings>, changeLabel: string) => void;
  updateAppearance: (patch: Partial<AppearanceSettings>, changeLabel: string) => void;
  updateCricket: (patch: Partial<CricketPreferences>, changeLabel: string) => void;
  updatePrivacy: (patch: Partial<PrivacySettings>, changeLabel: string) => void;
  updateStorage: (patch: Partial<StorageSettings>, changeLabel: string) => void;
  updateAppConfig: (patch: Partial<AppConfigSettings>, changeLabel: string) => void;
}

function initialProfile(): ProfileFields {
  return {
    name: "Player 4",
    username: "player4",
    email: "player4@club.com",
    mobileNumber: "+1 555 0102",
    dateOfBirth: "1998-03-12",
    country: "Australia",
    language: "English",
    bio: "Allrounder. Central Cricket Club. Loves chasing totals under lights.",
    organisation: "Central Cricket Club",
  };
}

function pushRecentChange(recentChanges: RecentChange[], label: string): RecentChange[] {
  const entry: RecentChange = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label, at: new Date().toISOString() };
  return [entry, ...recentChanges].slice(0, RECENT_CHANGES_LIMIT);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: initialProfile(),
      account: { twoFactorEnabled: true },
      preferences: {
        defaultLandingPage: "Dashboard",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24-hour",
        timeZone: "GMT+10",
        language: "English",
        measurementUnits: "Metric",
        defaultTournamentFormat: "T20",
        defaultOvers: "20",
        defaultTeamSorting: "Points",
      },
      notifications: {
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        tournamentUpdates: true,
        matchReminders: true,
        liveScoringAlerts: true,
        playerInvitations: true,
        teamInvitations: true,
        systemAnnouncements: true,
        marketing: false,
      },
      appearance: {
        theme: "system",
        accentColor: "ink",
        fontSize: "medium",
        density: "compact",
        reduceAnimations: false,
      },
      cricket: {
        preferredFormats: ["T20", "ODI"],
        favouriteTeams: ["Team A", "Team C"],
        favouritePlayers: ["Player 4"],
        favouriteTournaments: ["Premier League"],
        defaultScoringPreference: "Ball-by-ball",
        preferredStats: { battingAverage: true, strikeRate: true, economyRate: false },
      },
      privacy: {
        blockedUsers: ["Player 9", "Player 15"],
        dataSharing: false,
        analyticsConsent: true,
      },
      storage: {
        downloadedScorecards: Array.from({ length: 12 }, (_, i) => `Scorecard ${i + 1}`),
        downloadedReports: Array.from({ length: 4 }, (_, i) => `Report ${i + 1}`),
        downloadedAnalytics: Array.from({ length: 3 }, (_, i) => `Analytics Export ${i + 1}`),
        cacheMb: 128,
      },
      appConfig: {
        newScoringEngine: true,
        betaAnalytics: false,
        aiInsights: false,
        experimentalFeatures: false,
        apiEndpoint: "api.cricketos.internal/v2",
        debugMode: false,
        offlineMode: true,
        syncPreference: "Wi-Fi only",
      },
      recentChanges: [],

      updateProfile: (patch, changeLabel) =>
        set((s) => ({ profile: { ...s.profile, ...patch }, recentChanges: pushRecentChange(s.recentChanges, changeLabel) })),
      updateAccount: (patch, changeLabel) =>
        set((s) => ({ account: { ...s.account, ...patch }, recentChanges: pushRecentChange(s.recentChanges, changeLabel) })),
      updatePreferences: (patch, changeLabel) =>
        set((s) => ({ preferences: { ...s.preferences, ...patch }, recentChanges: pushRecentChange(s.recentChanges, changeLabel) })),
      updateNotifications: (patch, changeLabel) =>
        set((s) => ({ notifications: { ...s.notifications, ...patch }, recentChanges: pushRecentChange(s.recentChanges, changeLabel) })),
      updateAppearance: (patch, changeLabel) =>
        set((s) => ({ appearance: { ...s.appearance, ...patch }, recentChanges: pushRecentChange(s.recentChanges, changeLabel) })),
      updateCricket: (patch, changeLabel) =>
        set((s) => ({ cricket: { ...s.cricket, ...patch }, recentChanges: pushRecentChange(s.recentChanges, changeLabel) })),
      updatePrivacy: (patch, changeLabel) =>
        set((s) => ({ privacy: { ...s.privacy, ...patch }, recentChanges: pushRecentChange(s.recentChanges, changeLabel) })),
      updateStorage: (patch, changeLabel) =>
        set((s) => ({ storage: { ...s.storage, ...patch }, recentChanges: pushRecentChange(s.recentChanges, changeLabel) })),
      updateAppConfig: (patch, changeLabel) =>
        set((s) => ({ appConfig: { ...s.appConfig, ...patch }, recentChanges: pushRecentChange(s.recentChanges, changeLabel) })),
    }),
    {
      name: "willow-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
