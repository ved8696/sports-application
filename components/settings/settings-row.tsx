import Link from "next/link";
import { cn } from "@/lib/utils";

// Generic "label ... value / chevron" list row -- the recurring pattern
// across every Settings category screen (Account, Preferences, About, etc).
// Renders as a Link when href is given, a button when onClick is given, or
// a plain static row when neither is (e.g. "App Version 3.4.1").
export function SettingsRow({
  label,
  value,
  href,
  onClick,
  danger,
  chevron = Boolean(href || onClick),
  className,
}: {
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  chevron?: boolean;
  className?: string;
}) {
  const content = (
    <>
      <span className={cn("text-[12px] font-semibold", danger ? "text-red" : "text-foreground")}>{label}</span>
      <span className="flex items-center gap-1 text-[11px] font-normal text-muted-2">
        {value}
        {chevron && <span className="text-muted-2">›</span>}
      </span>
    </>
  );

  const rowClass = cn("flex items-center justify-between py-3 text-left", className);

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(rowClass, "w-full")}>
        {content}
      </button>
    );
  }
  return <div className={rowClass}>{content}</div>;
}

// Section header label ("CHANNELS", "ALERTS", "FEATURE FLAGS"...).
export function SettingsSectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="pb-1.5 pt-3.5 text-[10px] font-bold uppercase tracking-wide text-muted-2 first:pt-0">{children}</p>;
}
