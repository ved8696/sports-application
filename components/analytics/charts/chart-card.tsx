// Ported verbatim from the desktop app's components/dashboard/charts/chart-card.tsx
// (tooltip styling, spacing) -- only the Card import path changed.
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  description,
  className,
  children,
  action,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex-1 pt-1">{children}</CardContent>
    </Card>
  );
}

export const chartTooltipStyle = {
  contentStyle: {
    background: "#202020",
    border: "1px solid #2c2c2c",
    borderRadius: 12,
    fontSize: 12,
    padding: "8px 12px",
    boxShadow: "0 12px 28px -12px rgba(0,0,0,0.6)",
  },
  labelStyle: { color: "#a3a3a3", marginBottom: 2, fontSize: 11 },
  itemStyle: { padding: 0 },
} as const;
