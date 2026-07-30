"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

// Mobile stand-in for the desktop app's dialogs -- slides up from the bottom
// edge instead of centering a modal. Built on Radix Dialog (unused-but-
// installed in the desktop repo's dependency tree; this is its first real
// use) for accessible focus-trapping/escape/overlay behavior for free.
export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  dismissible = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  /** Set false for a required selection (e.g. picking a replacement batter) -- hides the close button and ignores Escape/overlay dismissal. */
  dismissible?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={dismissible ? onOpenChange : undefined}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          onEscapeKeyDown={(e) => !dismissible && e.preventDefault()}
          onPointerDownOutside={(e) => !dismissible && e.preventDefault()}
          onInteractOutside={(e) => !dismissible && e.preventDefault()}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[80vh] w-full max-w-[480px] flex-col rounded-t-[20px] border-t border-border bg-surface-2 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.7)]"
        >
          <div className="flex flex-none items-center justify-between px-5 pt-4 pb-3">
            <Dialog.Title className="text-[15px] font-bold">{title}</Dialog.Title>
            {dismissible && (
              <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-border bg-surface text-muted">
                <X size={14} />
              </Dialog.Close>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-5" style={{ paddingBottom: "calc(var(--safe-bottom) + 16px)" }}>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
