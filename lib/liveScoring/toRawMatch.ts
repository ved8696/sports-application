// Converts a completed LiveMatchState back into the same raw Cricsheet JSON
// shape lib/cricket/cricketParser.ts already knows how to parse -- so once
// written into /data, a completed live-scored match joins the historical
// dataset and every existing statistic (KPIs, team standings, tournament
// filters, analytics charts) picks it up automatically. Zero changes to
// dataLoader.ts or cricketParser.ts required; this is the "extend, don't
// replace" path for statistics/tournament updates.
//
// Known simplification: this app's live scorer doesn't attach penalty runs
// to a specific delivery (they're a standalone team-total bump -- see
// engine.ts's applyPenalty). Cricsheet's format requires every run to belong
// to a delivery, so any penalty runs accumulated during an innings are
// folded into a single synthetic trailing delivery so the reconstructed
// Match.innings.totalRuns still reconciles exactly with what was scored live.

import type { BallEvent, InningsState, LiveMatchState, WicketType } from "./types";
import type { Fixture } from "@/lib/cricket/fixture-types";
import type { RawDelivery, RawInnings, RawMatch, RawOver, RawWicket } from "@/lib/cricket/raw-types";
import { BOWLER_CREDITED_WICKETS } from "./types";

const WICKET_KIND: Record<WicketType, string> = {
  bowled: "bowled",
  caught: "caught",
  lbw: "lbw",
  "run-out": "run out",
  stumped: "stumped",
  "hit-wicket": "hit wicket",
  "retired-hurt": "retired hurt",
  "retired-out": "retired out",
  "timed-out": "timed out",
  "obstructing-field": "obstructing the field",
};

function deliveryFromEvent(event: BallEvent): RawDelivery {
  const extrasTotal = event.totalRuns - event.runsBat;
  const wickets: RawWicket[] | undefined = event.wicket
    ? [
        {
          kind: WICKET_KIND[event.wicket.type],
          player_out: event.wicket.playerOut,
          fielders: event.wicket.fielder ? [{ name: event.wicket.fielder }] : [],
          bowler: BOWLER_CREDITED_WICKETS.has(event.wicket.type) ? event.bowlerName : undefined,
        },
      ]
    : undefined;

  return {
    batter: event.strikerName,
    bowler: event.bowlerName,
    non_striker: event.nonStrikerName,
    runs: { batter: event.runsBat, extras: extrasTotal, total: event.totalRuns },
    extras:
      extrasTotal > 0
        ? {
            wides: event.extra === "wide" ? 1 + event.extraRuns : undefined,
            noballs: event.extra === "no-ball" ? 1 : undefined,
            byes: event.extra === "bye" ? event.extraRuns : undefined,
            legbyes: event.extra === "leg-bye" ? event.extraRuns : undefined,
          }
        : undefined,
    wickets,
  };
}

function penaltyDelivery(runs: number, lastEvent: BallEvent): RawDelivery {
  return {
    batter: lastEvent.strikerName,
    bowler: lastEvent.bowlerName,
    non_striker: lastEvent.nonStrikerName,
    runs: { batter: 0, extras: runs, total: runs },
    extras: { penalty: runs },
  };
}

function inningsToRaw(innings: InningsState): RawInnings {
  const overs: RawOver[] = innings.completedOvers.map((events, i) => ({
    over: i,
    deliveries: events.map(deliveryFromEvent),
  }));
  if (innings.currentOverEvents.length > 0) {
    overs.push({ over: innings.completedOvers.length, deliveries: innings.currentOverEvents.map(deliveryFromEvent) });
  }

  const penaltyRuns = innings.extrasTotal.penalty;
  if (penaltyRuns > 0) {
    const lastEvent = innings.events[innings.events.length - 1];
    if (lastEvent) {
      if (overs.length === 0) overs.push({ over: 0, deliveries: [] });
      overs[overs.length - 1].deliveries!.push(penaltyDelivery(penaltyRuns, lastEvent));
    }
  }

  return {
    team: innings.battingTeam,
    overs,
    declared: innings.endReason === "declared",
  };
}

function tossDecisionToRaw(decision: "bat" | "bowl"): string {
  return decision === "bowl" ? "field" : "bat";
}

export function liveMatchToRawMatch(fixture: Fixture, state: LiveMatchState): RawMatch {
  if (!fixture.teams || !fixture.toss || !fixture.playingXI) {
    throw new Error("Fixture is missing teams/toss/playingXI -- cannot archive an incomplete match.");
  }
  if (!state.result) {
    throw new Error("Match has no result yet -- cannot archive before it completes.");
  }
  const result = state.result;
  const teams: [string, string] = [fixture.teams[0].name, fixture.teams[1].name];
  const players: Record<string, string[]> = {};
  for (const xi of fixture.playingXI) players[xi.team] = xi.players;

  const innings = [state.innings1, state.innings2].filter((i): i is InningsState => Boolean(i)).map(inningsToRaw);

  return {
    meta: { data_version: "1.2.0", created: new Date().toISOString().slice(0, 10), revision: 1 },
    info: {
      balls_per_over: 6,
      city: fixture.venue.city,
      dates: [fixture.date],
      event: { name: fixture.tournament.name },
      gender: fixture.gender,
      match_type: fixture.format,
      team_type: "club",
      outcome:
        result.type === "win"
          ? { winner: result.winner, by: { runs: result.marginRuns, wickets: result.marginWickets } }
          : result.type === "tie"
            ? { result: "tie" }
            : result.type === "no-result"
              ? { result: "no result" }
              : { result: "draw" },
      player_of_match: state.potm ? [state.potm.playerOfMatch.name] : [],
      players,
      season: String(new Date(fixture.date).getFullYear()),
      teams,
      toss: { winner: fixture.toss.winner, decision: tossDecisionToRaw(fixture.toss.decision) },
      venue: fixture.venue.city ? `${fixture.venue.name}, ${fixture.venue.city}` : fixture.venue.name,
    },
    innings,
  };
}
