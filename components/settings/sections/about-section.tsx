"use client";

import { useState } from "react";
import { SettingsRow } from "@/components/settings/settings-row";
import { ComingSoonSheet } from "@/components/settings/coming-soon-sheet";

const LINKS = ["Release Notes", "Licences", "Privacy Policy", "Terms of Service", "Help Centre", "Contact Support", "Report a Bug", "Feedback"];

export function AboutSection() {
  const [stub, setStub] = useState<string | null>(null);

  return (
    <div className="flex flex-col divide-y divide-border">
      <SettingsRow label="App Version" value="3.4.1" chevron={false} />
      {LINKS.map((label) => (
        <SettingsRow key={label} label={label} onClick={() => setStub(label)} />
      ))}
      <ComingSoonSheet title={stub ?? ""} open={stub !== null} onOpenChange={(o) => !o && setStub(null)} />
    </div>
  );
}
