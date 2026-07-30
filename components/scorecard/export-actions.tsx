"use client";

import { useState } from "react";
import { Download, Link2, FileText, Check, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { LiveMatchState } from "@/lib/liveScoring/types";
import { copyShareLink, exportMatchAsJson } from "@/lib/liveScoring/export";

export function ExportActions({ state }: { state: LiveMatchState }) {
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);

  async function handleShare() {
    try {
      await copyShareLink(state.fixtureId);
      setShareError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser/OS (e.g. some embedded
      // webviews, restrictive permission policies) -- fail visibly instead
      // of leaving the tap looking like it did nothing.
      setCopied(false);
      setShareError(true);
      setTimeout(() => setShareError(false), 2500);
    }
  }

  return (
    <Card className="px-4 py-3.5">
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-wood">Export &amp; Share</p>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => exportMatchAsJson(state)} className="flex items-center gap-2.5 py-1.5 text-left text-[13px] text-foreground">
          <Download size={15} className="text-muted-2" />
          Download JSON Scorecard
        </button>
        <button
          type="button"
          onClick={handleShare}
          className={`flex items-center gap-2.5 py-1.5 text-left text-[13px] ${shareError ? "text-red" : "text-foreground"}`}
        >
          {shareError ? (
            <AlertTriangle size={15} className="text-red" />
          ) : copied ? (
            <Check size={15} className="text-wood" />
          ) : (
            <Link2 size={15} className="text-muted-2" />
          )}
          {shareError ? "Couldn't copy — clipboard access denied" : copied ? "Link copied" : "Copy Share Link"}
        </button>
        <button type="button" disabled className="flex items-center gap-2.5 py-1.5 text-left text-[13px] text-muted-2 opacity-50">
          <FileText size={15} />
          Export PDF (coming soon)
        </button>
      </div>
    </Card>
  );
}
