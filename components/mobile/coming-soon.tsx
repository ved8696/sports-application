import { type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader, ScreenBody } from "@/components/mobile/app-screen";
import { SearchAiButton } from "@/components/search/search-ai-button";

export function ComingSoon({
  title,
  note,
  icon,
  backHref,
}: {
  title: string;
  note: string;
  icon: LucideIcon;
  backHref?: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader backHref={backHref} title={title} trailing={<SearchAiButton />} />
      <ScreenBody className="flex flex-col justify-center">
        <EmptyState icon={icon} title="Coming in a future sprint" description={note} />
      </ScreenBody>
    </div>
  );
}
