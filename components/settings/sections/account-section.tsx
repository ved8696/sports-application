"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SettingsRow } from "@/components/settings/settings-row";
import { DeleteAccountSheet } from "@/components/settings/delete-account-sheet";
import { ComingSoonSheet } from "@/components/settings/coming-soon-sheet";
import { useSettingsStore } from "@/lib/store/settings-store";

export function AccountSection() {
  const router = useRouter();
  const { account, updateAccount } = useSettingsStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [stub, setStub] = useState<string | null>(null);

  function handleSignOut() {
    sessionStorage.removeItem("willow_user_email");
    router.push("/login");
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      <SettingsRow label="Change Password" href="/settings/account/change-password" />
      <div className="py-1">
        <ToggleSwitch
          label="Two-Factor Authentication"
          checked={account.twoFactorEnabled}
          onChange={(v) => updateAccount({ twoFactorEnabled: v }, `2FA → ${v ? "On" : "Off"}`)}
        />
      </div>
      <SettingsRow label="Linked Accounts" onClick={() => setStub("Linked Accounts")} />
      <SettingsRow label="Session Management" onClick={() => setStub("Session Management")} />
      <SettingsRow label="Active Devices" href="/settings/account/active-devices" />
      <SettingsRow label="Sign Out" onClick={handleSignOut} chevron={false} />
      <SettingsRow label="Delete Account" danger onClick={() => setDeleteOpen(true)} />

      <DeleteAccountSheet open={deleteOpen} onOpenChange={setDeleteOpen} />
      <ComingSoonSheet title={stub ?? ""} open={stub !== null} onOpenChange={(o) => !o && setStub(null)} />
    </div>
  );
}
