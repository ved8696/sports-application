"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ScreenHeader, ScreenBody } from "@/components/mobile/app-screen";
import { useTournamentStore } from "@/lib/store/tournament-store";
import type { TournamentVisibility } from "@/lib/tournament/types";

export default function TournamentSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const { tournaments, load, updateTournament, deleteTournament } = useTournamentStore();
  const [editing, setEditing] = useState<"info" | "rules" | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament) return null;

  async function handleVisibility(visibility: TournamentVisibility) {
    await updateTournament(id, { visibility });
  }

  async function handleArchive() {
    setBusy(true);
    try {
      await updateTournament(id, { archived: true });
      setArchiveOpen(false);
      router.push("/tournaments");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteTournament(id);
      router.push("/tournaments");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader backHref={`/tournaments/${id}`} title="Settings" />

      <ScreenBody>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">General</p>
        <Card className="mb-4 divide-y divide-border p-0">
          <SettingsRow label="Tournament Information" onClick={() => setEditing("info")} />
          <SettingsRow label="Rules & Format" onClick={() => setEditing("rules")} />
          <SettingsRow label="Teams & Squads" href={`/tournaments/${id}?tab=teams`} />
        </Card>

        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">Access</p>
        <Card className="mb-4 p-3.5">
          <p className="mb-2 text-[13px] font-semibold">Visibility</p>
          <SegmentedControl<TournamentVisibility>
            options={[
              { value: "Public", label: "Public" },
              { value: "Private", label: "Private" },
            ]}
            value={tournament.visibility}
            onChange={handleVisibility}
          />
        </Card>

        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-2">Danger Zone</p>
        <Card className="divide-y divide-border p-0">
          <SettingsRow label="Archive Tournament" onClick={() => setArchiveOpen(true)} />
          <SettingsRow label="! Delete Tournament" onClick={() => setDeleteOpen(true)} danger />
        </Card>
      </ScreenBody>

      <BottomSheet open={editing === "info"} onOpenChange={(o) => !o && setEditing(null)} title="Tournament Information">
        <InfoForm tournamentId={id} name={tournament.name} description={tournament.description} onDone={() => setEditing(null)} />
      </BottomSheet>

      <BottomSheet open={editing === "rules"} onOpenChange={(o) => !o && setEditing(null)} title="Rules & Format">
        <RulesForm tournamentId={id} oversPerInnings={tournament.rules.oversPerInnings} onDone={() => setEditing(null)} />
      </BottomSheet>

      <ConfirmSheet
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive Tournament"
        description="Archived tournaments are hidden from the dashboard but not deleted. You can find them later from Settings."
        confirmLabel="Archive Tournament"
        danger={false}
        busy={busy}
        onConfirm={handleArchive}
      />

      <ConfirmSheet
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Tournament"
        description={`This permanently deletes "${tournament.name}". Matches already created will remain in Matches, but will no longer be linked to a tournament.`}
        confirmLabel="Delete Tournament"
        busy={busy}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function SettingsRow({ label, onClick, href, danger }: { label: string; onClick?: () => void; href?: string; danger?: boolean }) {
  const cls = `flex items-center justify-between px-3.5 py-3 text-[12px] font-semibold ${danger ? "text-red" : "text-foreground"}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {label} <span className="text-muted-2">›</span>
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`w-full text-left ${cls}`}>
      {label} <span className="float-right text-muted-2">›</span>
    </button>
  );
}

function InfoForm({ tournamentId, name, description, onDone }: { tournamentId: string; name: string; description: string; onDone: () => void }) {
  const { updateTournament } = useTournamentStore();
  const [n, setN] = useState(name);
  const [d, setD] = useState(description);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateTournament(tournamentId, { name: n, description: d });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5 pb-2">
      <Input value={n} onChange={(e) => setN(e.target.value)} placeholder="Tournament name" />
      <textarea
        value={d}
        onChange={(e) => setD(e.target.value)}
        rows={3}
        placeholder="Description"
        className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-2 focus:border-blue/40 focus:outline-none focus:ring-1 focus:ring-blue/40"
      />
      <Button onClick={save} disabled={saving || !n.trim()}>
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}

function RulesForm({ tournamentId, oversPerInnings, onDone }: { tournamentId: string; oversPerInnings: number; onDone: () => void }) {
  const { tournaments, updateTournament } = useTournamentStore();
  const [overs, setOvers] = useState(oversPerInnings);
  const [saving, setSaving] = useState(false);
  const tournament = tournaments.find((t) => t.id === tournamentId);

  async function save() {
    if (!tournament) return;
    setSaving(true);
    try {
      await updateTournament(tournamentId, { rules: { ...tournament.rules, oversPerInnings: overs } });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5 pb-2">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium">Overs per innings</p>
        <Input type="number" min={1} value={overs} onChange={(e) => setOvers(Number(e.target.value) || 0)} className="h-9 w-20 text-center" />
      </div>
      <p className="text-[10.5px] text-muted-2">Only applies to fixtures generated after this change.</p>
      <Button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
