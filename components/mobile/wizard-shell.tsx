"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, STEP_TITLE, type WizardStep } from "@/lib/matchCreation/types";

// Shared layout for every /matches/new/* step: back button + title + progress
// bar in the header, a scrollable body, and a sticky footer for the
// forward action -- keeps all six wizard screens visually and structurally
// consistent.
export function WizardShell({
  step,
  backHref,
  children,
  footer,
}: {
  step: WizardStep;
  backHref: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const index = WIZARD_STEPS.indexOf(step);

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
              Step {index + 1} of {WIZARD_STEPS.length}
            </p>
            <h1 className="truncate text-lg font-extrabold">{STEP_TITLE[step]}</h1>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s} className={cn("h-1 flex-1 rounded-full", i <= index ? "bg-wood" : "bg-surface-3")} />
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
