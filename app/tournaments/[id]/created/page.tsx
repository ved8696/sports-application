"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTournamentStore } from "@/lib/store/tournament-store";

export default function TournamentCreatedPage() {
  const params = useParams();
  const router = useRouter();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const { tournaments, status, load } = useTournamentStore();

  useEffect(() => {
    load();
  }, [load]);

  const tournament = tournaments.find((t) => t.id === id);

  useEffect(() => {
    if (status === "ready" && !tournament) router.replace("/tournaments");
  }, [status, tournament, router]);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
        <Check size={30} />
      </div>
      <h1 className="mb-2 text-lg font-extrabold">Tournament Created!</h1>
      <p className="mb-7 text-xs text-muted-2">
        {tournament?.name ?? "Your tournament"} is ready. Add fixtures to get started.
      </p>
      <Button asChild className="mb-2.5">
        <Link href={`/tournaments/${id}`}>View Tournament</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/tournaments">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
