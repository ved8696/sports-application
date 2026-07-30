"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-semibold">Setting not found</p>
        <Link href="/settings" className="text-xs font-semibold text-blue">
          Back to Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center gap-3 px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <Link href="/settings" className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="flex-1 text-lg font-extrabold">{CATEGORY_LABEL[categoryParam]}</h1>
        {categoryParam === "app-configuration" && (
          <span className="flex-none rounded-md bg-foreground px-2 py-1 text-[9px] font-bold text-background">ADMIN</span>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <CategoryContent category={categoryParam} />
      </div>
    </div>
  );
}
