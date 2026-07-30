"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SettingsRow } from "@/components/settings/settings-row";
import { ComingSoonSheet } from "@/components/settings/coming-soon-sheet";
import { useSettingsStore } from "@/lib/store/settings-store";

export function PrivacySecuritySection() {
  const { privacy, updatePrivacy } = useSettingsStore();
  const [stub, setStub] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function exportData() {
    setExported(true);
    updatePrivacy({}, "Personal data exported");
    setTimeout(() => setExported(false), 2500);
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      <SettingsRow label="Privacy Controls" onClick={() => setStub("Privacy Controls")} />
      <SettingsRow label="Blocked Users" value={String(privacy.blockedUsers.length)} onClick={() => setStub("Blocked Users")} />
      <div className="py-1">
        <ToggleSwitch
          label="Data Sharing"
          checked={privacy.dataSharing}
          onChange={(v) => updatePrivacy({ dataSharing: v }, `Data Sharing → ${v ? "On" : "Off"}`)}
        />
      </div>
      <div className="py-1">
        <ToggleSwitch
          label="Analytics Consent"
          checked={privacy.analyticsConsent}
          onChange={(v) => updatePrivacy({ analyticsConsent: v }, `Analytics Consent → ${v ? "On" : "Off"}`)}
        />
      </div>
      <SettingsRow label={exported ? "Export Personal Data ✓ Exported" : "Export Personal Data"} onClick={exportData} />
      <SettingsRow label="Delete My Data" danger onClick={() => setDeleting(true)} />
      <SettingsRow label="App Permissions" onClick={() => setStub("App Permissions")} />

      <ComingSoonSheet title={stub ?? ""} open={stub !== null} onOpenChange={(o) => !o && setStub(null)} />
      <ComingSoonSheet title="Delete My Data" open={deleting} onOpenChange={setDeleting} />
    </div>
  );
}
