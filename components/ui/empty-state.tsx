import { Loader2, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// One icon-circle + title + description(+action) card for every loading,
// empty, and error placeholder in the app -- previously each screen
// hand-rolled its own Card with slightly different icon-circle sizes, py
// values, and text sizes (Dashboard's loading/error/empty Cards, ComingSoon's
// "Coming in a future sprint" card, Tournament details' not-found state,
// etc. all differed slightly). Two sizes cover both a full-screen state and
// a smaller in-section one (e.g. "Nothing scheduled yet" under a section
// heading that already has content above it).
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "muted",
  size = "full",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "muted" | "danger";
  size?: "full" | "compact";
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col items-center gap-2.5 text-center", size === "full" ? "py-14" : "py-8", className)}>
      <div
        className={cn(
          "flex h-11 w-11 flex-none items-center justify-center rounded-full",
          tone === "danger" ? "bg-red/12 text-red" : "bg-wood/12 text-wood"
        )}
      >
        <Icon size={20} />
      </div>
      <p className="text-sm font-bold">{title}</p>
      {description && <p className="max-w-[260px] text-xs leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-1.5">{action}</div>}
    </Card>
  );
}

export function LoadingState({ label = "Loading…", size = "full", className }: { label?: string; size?: "full" | "compact"; className?: string }) {
  return (
    <Card className={cn("flex items-center justify-center gap-2.5 text-sm text-muted", size === "full" ? "py-14" : "py-8", className)}>
      <Loader2 size={16} className="animate-spin text-blue" />
      {label}
    </Card>
  );
}
