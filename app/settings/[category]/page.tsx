"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader, ScreenBody } from "@/components/mobile/app-screen";
import { CategoryContent } from "@/components/settings/category-content";
import { CATEGORY_LABEL, SETTINGS_CATEGORIES, type SettingsCategory } from "@/lib/settings/types";

function isValidCategory(value: string): value is SettingsCategory {
  return (SETTINGS_CATEGORIES as readonly string[]).includes(value);
}

export default function SettingsCategoryPage() {
  const params = useParams();
  const categoryParam = (Array.isArray(params.category) ? params.category[0] : params.category) as string;

  if (!isValidCategory(categoryParam)) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <ScreenHeader backHref="/settings" title="Settings" />
        <ScreenBody className="flex flex-col justify-center">
          <EmptyState
            icon={SearchX}
            title="Setting not found"
            description="This setting may have been removed, or the link is incorrect."
            action={
              <Button size="sm" asChild>
                <Link href="/settings">Back to Settings</Link>
              </Button>
            }
          />
        </ScreenBody>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader
        backHref="/settings"
        title={CATEGORY_LABEL[categoryParam]}
        trailing={
          categoryParam === "app-configuration" ? (
            <span className="flex-none rounded-md bg-foreground px-2 py-1 text-[9px] font-bold text-background">ADMIN</span>
          ) : undefined
        }
      />

      <ScreenBody>
        <CategoryContent category={categoryParam} />
      </ScreenBody>
    </div>
  );
}
