import { ProfileSection } from "./sections/profile-section";
import { AccountSection } from "./sections/account-section";
import { PreferencesSection } from "./sections/preferences-section";
import { NotificationsSection } from "./sections/notifications-section";
import { AppearanceSection } from "./sections/appearance-section";
import { CricketPreferencesSection } from "./sections/cricket-preferences-section";
import { PrivacySecuritySection } from "./sections/privacy-security-section";
import { StorageDownloadsSection } from "./sections/storage-downloads-section";
import { AboutSection } from "./sections/about-section";
import { AppConfigurationSection } from "./sections/app-configuration-section";
import type { SettingsCategory } from "@/lib/settings/types";

export function CategoryContent({ category }: { category: SettingsCategory }) {
  switch (category) {
    case "profile":
      return <ProfileSection />;
    case "account":
      return <AccountSection />;
    case "preferences":
      return <PreferencesSection />;
    case "notifications":
      return <NotificationsSection />;
    case "appearance":
      return <AppearanceSection />;
    case "cricket-preferences":
      return <CricketPreferencesSection />;
    case "privacy-security":
      return <PrivacySecuritySection />;
    case "storage-downloads":
      return <StorageDownloadsSection />;
    case "about":
      return <AboutSection />;
    case "app-configuration":
      return <AppConfigurationSection />;
    default:
      return null;
  }
}
