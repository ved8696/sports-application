"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SettingsRow } from "@/components/settings/settings-row";
import { ComingSoonSheet } from "@/components/settings/coming-soon-sheet";
import { useSettingsStore } from "@/lib/store/settings-store";

const TOTAL_MB = 2048;
const USED_MB = 412;
const BREAKDOWN = [
  { label: "Scorecards", pct: 22, color: "bg-foreground" },
  { label: "Reports", pct: 14, color: "bg-muted" },
  { label: "Analytics", pct: 10, color: "bg-muted-2" },
  { label: "Cache", pct: 8, color: "bg-border" },
];

export function StorageDownloadsSection() {
  const { storage, updateStorage } = useSettingsStore();
  const [stub, setStub] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);

  function clearCache() {
    updateStorage({ cacheMb: 0 }, "Cache cleared");
    setCleared(true);
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold">
          <span>Storage Used</span>
          <span>
            {USED_MB} MB / {(TOTAL_MB / 1024).toFixed(0)} GB
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-surface-3">
          {BREAKDOWN.map((seg) => (
            <div key={seg.label} className={seg.color} style={{ width: `${seg.pct}%` }} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2.5 text-[9px] text-muted-2">
          {BREAKDOWN.map((seg) => (
            <span key={seg.label}>■ {seg.label}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border">
        <SettingsRow label="Downloaded Scorecards" value={String(storage.downloadedScorecards.length)} onClick={() => setStub("Downloaded Scorecards")} />
        <SettingsRow label="Downloaded Reports" value={String(storage.downloadedReports.length)} onClick={() => setStub("Downloaded Reports")} />
        <SettingsRow label="Downloaded Analytics" value={String(storage.downloadedAnalytics.length)} onClick={() => setStub("Downloaded Analytics")} chevron={false} />
      </div>

      <div className="pt-5">
        <Button variant="outline" onClick={clearCache} disabled={storage.cacheMb === 0}>
          {cleared ? "Cache Cleared" : `Clear Cache · ${storage.cacheMb} MB`}
        </Button>
      </div>

      <ComingSoonSheet title={stub ?? ""} open={stub !== null} onOpenChange={(o) => !o && setStub(null)} />
    </div>
  );
}
