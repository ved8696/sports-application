"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// The one header/body shell every primary tab screen (Dashboard, Settings,
// Matches, Tournaments, Analytics, Players/Teams/Score, ...) should render
// through -- consistent safe-area top padding, horizontal padding, and
// scroll behaviour instead of each screen hand-rolling its own copy of the
// same handful of Tailwind classes (which is how Settings' layout drifted
// from Dashboard's in the first place). Wizard flows keep their own
// WizardShell (progress bar + sticky footer is a different, deliberately
// distinct pattern) -- this is only for the tab-bar-level screens.
export function ScreenHeader({
  backHref,
  title,
  subtitle,
  trailing,
  className,
}: {
  /** Renders a back-chevron button before the title when set. Omit for top-level tab screens (Dashboard, Settings, ...). */
  backHref?: string;
  /** A plain string renders as the standard h1; pass a custom node (e.g. Dashboard's greeting + name) when the title block itself needs to differ. */
  title: React.ReactNode;
  /** Small caption rendered below the title, e.g. "Deep-dive stats across every tracked match". */
  subtitle?: string;
  /** Right-aligned icon buttons/actions, e.g. <SearchAiButton />. */
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn("flex flex-none items-center gap-3 px-5 pb-4", className)}
      style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}
    >
      {backHref && (
        <Link
          href={backHref}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
        >
          <ArrowLeft size={16} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        {typeof title === "string" ? <h1 className="truncate text-lg font-extrabold">{title}</h1> : title}
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {trailing && <div className="flex flex-none items-center gap-2">{trailing}</div>}
    </header>
  );
}

export function ScreenBody({
  children,
  className,
  padBottom = "pb-6",
}: {
  children: React.ReactNode;
  className?: string;
  /** Override when a screen has a floating footer/CTA bar that needs extra clearance, e.g. "pb-24". */
  padBottom?: string;
}) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto px-5", padBottom, className)}>{children}</div>;
}
