import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ComingSoon({
  title,
  note,
  icon: Icon,
  backHref,
}: {
  title: string;
  note: string;
  icon: LucideIcon;
  backHref?: string;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header
        className="flex flex-none items-center gap-3 px-5 pb-4"
        style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}
      >
        {backHref && (
          <Link
            href={backHref}
            className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted"
          >
            <ArrowLeft size={16} />
          </Link>
        )}
        <h1 className="text-lg font-extrabold">{title}</h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <Card className="flex w-full flex-col items-center gap-3 py-12">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-wood/12 text-wood">
            <Icon size={20} />
          </div>
          <p className="text-sm font-bold">Coming in a future sprint</p>
          <p className="max-w-[240px] text-xs text-muted">{note}</p>
        </Card>
      </div>
    </div>
  );
}
