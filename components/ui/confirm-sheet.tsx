"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

// One confirmation pattern for every destructive/irreversible action
// (delete, remove, archive, discard, undo, finish/cancel match, ...) instead
// of each screen hand-rolling its own BottomSheet + button pair with
// slightly different copy and layout.
export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busyLabel,
  danger = true,
  busy = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busyLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
}) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title} dismissible={!busy}>
      <div className="flex flex-col gap-4 pb-2">
        {description && <p className="text-[13px] leading-relaxed text-muted">{description}</p>}
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>
            {busy ? (busyLabel ?? `${confirmLabel}…`) : confirmLabel}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
