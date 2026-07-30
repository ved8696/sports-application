"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Input } from "@/components/ui/input";
import { SettingsRow, SettingsSectionLabel } from "@/components/settings/settings-row";
import { SelectSheet } from "@/components/settings/select-sheet";
import { ComingSoonSheet } from "@/components/settings/coming-soon-sheet";
import { FieldLabel } from "@/components/match-creation/form-field";
import { useSettingsStore } from "@/lib/store/settings-store";

export function AppConfigurationSection() {
  const { appConfig, updateAppConfig } = useSettingsStore();
  const [syncSheetOpen, setSyncSheetOpen] = useState(false);
  const [devOptionsOpen, setDevOptionsOpen] = useState(false);
  const [endpoint, setEndpoint] = useState(appConfig.apiEndpoint);

  function commitEndpoint() {
    if (endpoint.trim() && endpoint !== appConfig.apiEndpoint) {
      updateAppConfig({ apiEndpoint: endpoint.trim() }, "API Endpoint updated");
    }
  }

  return (
    <div className="flex flex-col">
      <SettingsSectionLabel>Feature Flags</SettingsSectionLabel>
      <div className="flex flex-col divide-y divide-border">
        <div className="py-1">
          <ToggleSwitch
            label="New Scoring Engine"
            checked={appConfig.newScoringEngine}
            onChange={(v) => updateAppConfig({ newScoringEngine: v }, `New Scoring Engine → ${v ? "On" : "Off"}`)}
          />
        </div>
        <div className="py-1">
          <ToggleSwitch
            label="Beta Analytics"
            checked={appConfig.betaAnalytics}
            onChange={(v) => updateAppConfig({ betaAnalytics: v }, `Beta Analytics → ${v ? "On" : "Off"}`)}
          />
        </div>
        <div className="py-1">
          <ToggleSwitch
            label="AI Insights"
            checked={appConfig.aiInsights}
            onChange={(v) => updateAppConfig({ aiInsights: v }, `AI Insights → ${v ? "On" : "Off"}`)}
          />
        </div>
      </div>

      <div className="border-y border-border py-1">
        <ToggleSwitch
          label="Experimental Features"
          checked={appConfig.experimentalFeatures}
          onChange={(v) => updateAppConfig({ experimentalFeatures: v }, `Experimental Features → ${v ? "On" : "Off"}`)}
        />
      </div>

      <div className="py-3.5">
        <FieldLabel htmlFor="api-endpoint">API Endpoint</FieldLabel>
        <Input
          id="api-endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          onBlur={commitEndpoint}
          className="font-mono text-xs"
        />
      </div>

      <div className="flex flex-col divide-y divide-border border-t border-border">
        <div className="py-1">
          <ToggleSwitch
            label="Debug Mode"
            checked={appConfig.debugMode}
            onChange={(v) => updateAppConfig({ debugMode: v }, `Debug Mode → ${v ? "On" : "Off"}`)}
          />
        </div>
        <div className="py-1">
          <ToggleSwitch
            label="Offline Mode"
            checked={appConfig.offlineMode}
            onChange={(v) => updateAppConfig({ offlineMode: v }, `Offline Mode → ${v ? "On" : "Off"}`)}
          />
        </div>
        <SettingsRow label="Sync Preferences" value={appConfig.syncPreference} onClick={() => setSyncSheetOpen(true)} />
        <SettingsRow label="Developer Options" onClick={() => setDevOptionsOpen(true)} />
      </div>

      <SelectSheet
        title="Sync Preferences"
        open={syncSheetOpen}
        onOpenChange={setSyncSheetOpen}
        options={["Wi-Fi only", "Wi-Fi and cellular", "Manual only"]}
        value={appConfig.syncPreference}
        onSelect={(v) => {
          updateAppConfig({ syncPreference: v }, `Sync Preferences → ${v}`);
          setSyncSheetOpen(false);
        }}
      />
      <ComingSoonSheet title="Developer Options" open={devOptionsOpen} onOpenChange={setDevOptionsOpen} />
    </div>
  );
}
