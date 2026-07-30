"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldError } from "@/components/match-creation/form-field";
import { useSettingsStore } from "@/lib/store/settings-store";

function passwordStrength(pw: string): { pct: number; label: string } {
  if (!pw) return { pct: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  const pct = Math.min(100, (score / 5) * 100);
  const label = score <= 1 ? "Weak" : score <= 3 ? "Medium" : "Strong";
  return { pct, label };
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { updateAccount } = useSettingsStore();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const strength = useMemo(() => passwordStrength(next), [next]);

  async function handleUpdate() {
    setError(null);
    if (!current) return setError("Enter your current password.");
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("Passwords don't match.");
    setSaving(true);
    updateAccount({}, "Password changed");
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setDone(true);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center gap-3 px-5 pb-4" style={{ paddingTop: "calc(var(--safe-top) + 20px)" }}>
        <Link href="/settings/account" className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-border bg-surface-2 text-muted">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-lg font-extrabold">Change Password</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {done ? (
          <p className="rounded-xl border border-border bg-surface-2 p-4 text-center text-sm font-semibold text-foreground">
            Password updated.
          </p>
        ) : (
          <div className="flex flex-col gap-3.5">
            <div>
              <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
              <Input id="current-password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div>
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>
              <Input id="new-password" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
              {next && (
                <>
                  <div className="mt-1.5 h-1 rounded-full bg-surface-3">
                    <div className="h-1 rounded-full bg-foreground transition-all" style={{ width: `${strength.pct}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-2">{strength.label}</p>
                </>
              )}
            </div>
            <div>
              <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
              <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {error && <FieldError>{error}</FieldError>}
          </div>
        )}
      </div>

      <div className="flex-none px-5" style={{ paddingBottom: "calc(var(--safe-bottom) + 16px)" }}>
        {done ? (
          <Button onClick={() => router.push("/settings/account")}>Back to Account</Button>
        ) : (
          <Button onClick={handleUpdate} disabled={saving}>
            {saving ? "Updating…" : "Update Password"}
          </Button>
        )}
      </div>
    </div>
  );
}
