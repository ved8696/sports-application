"use client";

// Shared bootstrap for every /matches/[id]/setup/* step: resolves the fixture
// id from the route, loads match history (for roster/team seed data) and the
// fixture list, and hydrates the setup draft from the fixture's own
// server-side state the first time it becomes available. Used by every step
// page instead of each repeating the same wiring.

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useCricketStore } from "@/lib/store/cricket-store";
import { useFixtureStore } from "@/lib/store/fixture-store";
import { useMatchSetupStore } from "@/lib/store/match-setup-store";

export function useSetupFixture() {
  const params = useParams();
  const fixtureId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { matches, status: matchStatus, load: loadMatches } = useCricketStore();
  const { fixtures, status: fixtureStatus, load: loadFixtures } = useFixtureStore();
  const hydrateFromFixture = useMatchSetupStore((s) => s.hydrateFromFixture);

  useEffect(() => {
    loadMatches();
    loadFixtures();
  }, [loadMatches, loadFixtures]);

  const fixture = fixtures.find((f) => f.id === fixtureId) ?? null;

  useEffect(() => {
    if (fixture) hydrateFromFixture(fixture);
  }, [fixture, hydrateFromFixture]);

  return { fixtureId, fixture, matches, matchStatus, fixtureStatus };
}
