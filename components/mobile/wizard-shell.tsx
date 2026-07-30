"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared layout for every multi-step wizard flow (match creation under
// /matches/new/*, pre-match setup under /matches/[id]/setup/*): back button +
// title + progress bar in the header, a scrollable body, and a sticky footer
// for the forward action -- keeps every wizard screen visually and
// structurally consistent regardless of which flow it belongs to.
export function WizardShell({
  title,
  stepIndex,
  stepCount,
  backHref,
  children,
  footer,
}: {
  title: string;
  stepIndex: number;
  stepCount: number;
  backHref: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex-none px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-wood">
              Step {stepIndex + 1} of {stepCount}
            </p>
            <h1 className="truncate text-lg font-extrabold">{title}</h1>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: stepCount }).map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full", i <= stepIndex ? "bg-wood" : "bg-surface-3")} />
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>

      <footer
        className="flex-none border-t border-white/[0.06] bg-background/95 px-5 pt-3 backdrop-blur-md"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 14px)" }}
      >
        {footer}
      </footer>
    </div>
  );
}
