// Settings domain model + static category metadata. One flat Zustand-backed
// preferences object (lib/store/settings-store.ts) covers every category in
// the wireframe; this file only holds shapes and the category list shared by
// Settings Home (list/search) and the tablet master-detail shell.

export const SETTINGS_CATEGORIES = [
  "profile",
  "account",
  "preferences",
  "notifications",
  "appearance",
  "cricket-preferences",
  "privacy-security",
  "storage-downloads",
  "about",
  "app-configuration",
] as const;

export type SettingsCategory = (typeof SETTINGS_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<SettingsCategory, string> = {
  profile: "Profile",
  account: "Account",
  preferences: "Preferences",
  notifications: "Notifications",
  appearance: "Appearance",
  "cricket-preferences": "Cricket Preferences",
  "privacy-security": "Privacy & Security",
  "storage-downloads": "Storage & Downloads",
  about: "About",
  "app-configuration": "App Configuration",
};

export interface ProfileFields {
  name: string;
  username: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  country: string;
  language: string;
  bio: string;
  organisation: string;
}

export type ProfileFieldKey = keyof ProfileFields;

export const PROFILE_FIELD_LABEL: Record<ProfileFieldKey, string> = {
  name: "Name",
  username: "Username",
  email: "Email",
  mobileNumber: "Mobile Number",
  dateOfBirth: "Date of Birth",
  country: "Country",
  language: "Language",
  bio: "Bio",
  organisation: "Organisation",
};

export const PROFILE_FIELD_MAX_LENGTH: Partial<Record<ProfileFieldKey, number>> = {
  bio: 160,
};

export interface AccountSettings {
  twoFactorEnabled: boolean;
}

export interface PreferencesSettings {
  defaultLandingPage: string;
  dateFormat: string;
  timeFormat: string;
  timeZone: string;
  language: string;
  measurementUnits: string;
  defaultTournamentFormat: string;
  defaultOvers: string;
  defaultTeamSorting: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  tournamentUpdates: boolean;
  matchReminders: boolean;
  liveScoringAlerts: boolean;
  playerInvitations: boolean;
  teamInvitations: boolean;
  systemAnnouncements: boolean;
  marketing: boolean;
}

export type ThemePreference = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";
export type DisplayDensity = "compact" | "comfortable" | "spacious";
export type AccentColor = "ink" | "slate" | "wood";

export interface AppearanceSettings {
  theme: ThemePreference;
  accentColor: AccentColor;
  fontSize: FontSize;
  density: DisplayDensity;
  reduceAnimations: boolean;
}

export const CRICKET_FORMATS = ["T10", "T20", "ODI", "Test"] as const;
export type CricketFormat = (typeof CRICKET_FORMATS)[number];

export interface CricketPreferences {
  preferredFormats: CricketFormat[];
  favouriteTeams: string[];
  favouritePlayers: string[];
  favouriteTournaments: string[];
  defaultScoringPreference: string;
  preferredStats: { battingAverage: boolean; strikeRate: boolean; economyRate: boolean };
}

export interface PrivacySettings {
  blockedUsers: string[];
  dataSharing: boolean;
  analyticsConsent: boolean;
}

export interface StorageSettings {
  downloadedScorecards: string[];
  downloadedReports: string[];
  downloadedAnalytics: string[];
  cacheMb: number;
}

export interface AppConfigSettings {
  newScoringEngine: boolean;
  betaAnalytics: boolean;
  aiInsights: boolean;
  experimentalFeatures: boolean;
  apiEndpoint: string;
  debugMode: boolean;
  offlineMode: boolean;
  syncPreference: string;
}

export interface RecentChange {
  id: string;
  label: string;
  at: string;
}
