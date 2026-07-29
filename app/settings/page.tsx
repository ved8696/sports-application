import { Settings as SettingsIcon } from "lucide-react";
import { ComingSoon } from "@/components/mobile/coming-soon";

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      note="Profile, notifications, and integrations settings are planned for a later sprint."
      icon={SettingsIcon}
    />
  );
}
