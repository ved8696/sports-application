import Link from "next/link";
import { Card } from "@/components/ui/card";

// Review-screen section: a titled card with an Edit link back to the step
// that owns the data, wrapping a stack of SummaryRow children.
export function ReviewSection({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="px-4">
      <div className="flex items-center justify-between pt-3.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-wood">{title}</p>
        <Link href={editHref} className="text-[11.5px] font-semibold text-blue">
          Edit
        </Link>
      </div>
      <div className="divide-y divide-white/[0.06]">{children}</div>
    </Card>
  );
}

export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[12px] text-muted-2">{label}</span>
      <span className="text-right text-[13px] font-semibold">{value}</span>
    </div>
  );
}
