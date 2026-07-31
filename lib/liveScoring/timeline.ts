// Derives a chronological list of match milestones from data the engine
// already records (toss, innings status/endReason, fall of wickets,
// partnerships) -- no separate "event log" is stored; this is a pure
// read-side projection, same spirit as lib/liveScoring/scoreboard.ts.

import type { Fixture } from "@/lib/cricket/fixture-types";
import type { InningsState, LiveMatchState } from "./types";
import { WICKET_LABELS } from "./wickets";
import { oversLabel } from "./overs";

export type TimelineKind = "toss" | "start" | "wicket" | "partnership" | "break" | "complete";

export interface TimelineEntry {
  key: string;
  kind: TimelineKind;
  title: string;
  detail: string;
  done: boolean;
}

function inningsEntries(innings: InningsState): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  if (innings.events.length > 0) {
    entries.push({
      key: `start-${innings.inningsNumber}`,
      kind: "start",
      title: `Innings ${innings.inningsNumber} Started`,
      detail: `${innings.battingTeam} begin their innings, ${innings.bowlingTeam} to bowl.`,
      done: true,
    });
  }

  for (const fow of innings.fallOfWickets) {
    entries.push({
      key: `wkt-${innings.inningsNumber}-${fow.wicketNumber}`,
      kind: "wicket",
      title: "Wicket",
      detail: `${fow.playerOut} — ${WICKET_LABELS[fow.dismissal]} · ${innings.battingTeam} ${fow.teamRuns}/${fow.wicketNumber} (${fow.overLabel} ov)`,
      done: true,
    });
  }

  for (const p of innings.partnerships) {
    if (p.runs >= 50) {
      entries.push({
        key: `pship-${innings.inningsNumber}-${p.batterA}-${p.batterB}`,
        kind: "partnership",
        title: "Fifty Partnership",
        detail: `${p.batterA} & ${p.batterB} — ${p.runs} runs (${p.balls} balls)`,
        done: true,
      });
    }
  }

  if (innings.status === "completed") {
    entries.push({
      key: `break-${innings.inningsNumber}`,
      kind: "break",
      title: innings.inningsNumber === 1 ? "Innings Break" : "Innings Complete",
      detail: `${innings.battingTeam} finish on ${innings.totalRuns}/${innings.totalWickets} (${oversLabel(innings.legalBalls)} ov)${
        innings.inningsNumber === 1 ? ` · Target for ${innings.bowlingTeam}: ${innings.totalRuns + 1}` : ""
      }`,
      done: true,
    });
  }

  return entries;
}

export function buildMatchTimeline(fixture: Fixture, state: LiveMatchState): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  if (fixture.toss) {
    entries.push({
      key: "toss",
      kind: "toss",
      title: "Toss",
      detail: `${fixture.toss.winner} won the toss and elected to ${fixture.toss.decision === "bat" ? "bat" : "bowl"}.`,
      done: true,
    });
  }

  entries.push(...inningsEntries(state.innings1));
  if (state.innings2) entries.push(...inningsEntries(state.innings2));

  if (state.status === "completed" && state.result) {
    entries.push({ key: "complete", kind: "complete", title: "Match Finished", detail: state.result.summaryText, done: true });
  } else {
    entries.push({ key: "pending-complete", kind: "complete", title: "Match Finished", detail: "Result pending.", done: false });
  }

  return entries;
}
