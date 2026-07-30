"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Wireframe screen #8 shows this as a centered dialog with a dimmed
// backdrop rather than a bottom sheet -- the app has exactly one modal
// primitive (components/ui/bottom-sheet.tsx, already reused for the
// Tournament module's own Archive/Delete confirmations), so this reuses it
// rather than introducing a second overlay pattern for one screen.
export function DeleteAccountSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    sessionStorage.removeItem("willow_user_email");
    router.push("/login");
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Delete Account?">
      <div className="flex flex-col gap-3.5 pb-2">
        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-muted">
          <AlertTriangle size={14} className="mt-0.5 flex-none text-red" />
          This permanently removes your profile, stats, and history. This cannot be undone.
        </p>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE to confirm"
        />
        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" disabled={confirmText !== "DELETE" || deleting} onClick={handleDelete}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
