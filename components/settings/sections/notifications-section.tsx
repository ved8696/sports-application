"use client";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SettingsSectionLabel } from "@/components/settings/settings-row";
import { useSettingsStore } from "@/lib/store/settings-store";
import type { NotificationSettings } from "@/lib/settings/types";

const CHANNELS: { key: keyof NotificationSettings; label: string }[] = [
  { key: "pushEnabled", label: "Push Notifications" },
  { key: "emailEnabled", label: "Email Notifications" },
  { key: "smsEnabled", label: "SMS Notifications" },
];

const ALERTS: { key: keyof NotificationSettings; label: string }[] = [
  { key: "tournamentUpdates", label: "Tournament Updates" },
  { key: "matchReminders", label: "Match Reminders" },
  { key: "liveScoringAlerts", label: "Live Scoring Alerts" },
  { key: "playerInvitations", label: "Player Invitations" },
  { key: "teamInvitations", label: "Team Invitations" },
  { key: "systemAnnouncements", label: "System Announcements" },
  { key: "marketing", label: "Marketing" },
];

export function NotificationsSection() {
  const { notifications, updateNotifications } = useSettingsStore();

  function toggleRows(rows: { key: keyof NotificationSettings; label: string }[]) {
    return rows.map(({ key, label }) => (
      <ToggleSwitch
        key={key}
        label={label}
        checked={notifications[key]}
        onChange={(v) => updateNotifications({ [key]: v }, `${label} → ${v ? "On" : "Off"}`)}
      />
    ));
  }

  return (
    <div>
      <SettingsSectionLabel>Channels</SettingsSectionLabel>
      <div className="flex flex-col divide-y divide-border md:grid md:grid-cols-2 md:gap-x-6">{toggleRows(CHANNELS)}</div>
      <SettingsSectionLabel>Alerts</SettingsSectionLabel>
      <div className="flex flex-col divide-y divide-border md:grid md:grid-cols-2 md:gap-x-6">{toggleRows(ALERTS)}</div>
    </div>
  );
}
