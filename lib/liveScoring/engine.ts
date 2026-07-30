// The Ball Event Engine / Match State Manager. This is the single place a
// delivery turns into a new InningsState -- every dependent stat (batter,
// bowler, partnership, fall of wickets, over progress, strike) is updated
// together here so none of them can ever drift out of sync. Pure: no React,
// no fetch, no fs. lib/store/live-scoring-store.ts is the only caller.
//
// Known simplifications (documented rather than hidden, given real cricket's
// full edge-case rulebook is far larger than a first-innings MVP needs):
// - A wicket clears whichever batter slot (striker/non-striker) it names;
//   the surviving batter keeps their current slot label rather than being
//   walked through a physical-end swap. The new batter fills the empty slot.
// - Runs "completed" on a run-out are credited to the striker and do not
//   themselves trigger the usual odd/even strike rotation -- the wicket-slot
//   clearing above supersedes it for that ball.

import type { BallEvent, BallInput, InningsState } from "./types";
import { computeExtras } from "./extras";
import { bowlerCredited } from "./wickets";
import { isOverComplete, legalBallsInOver, nextBallInOver, oversLabel } from "./overs";
import { applyBallToBatter, createBatter, dismissBatter, retireBatter } from "./batters";
import { applyBallToBowler, applyMaiden, createBowler } from "./bowlers";
import { applyBallToPartnership, closePartnership, newPartnership } from "./partnerships";

let idSeq = 0;
function nextBallId(): string {
  idSeq += 1;
  return `ball-${Date.now()}-${idSeq}`;
}

export interface ApplyBallOptions {
  freeHitEnabled: boolean;
}

export interface ApplyBallResult {
  innings: InningsState;
  event: BallEvent;
}

export function applyBall(innings: InningsState, input: BallInput, options: ApplyBallOptions): ApplyBallResult {
  if (!innings.strikerName || !innings.nonStrikerName || !innings.currentBowlerName) {
    throw new Error("Cannot record a ball without both batters and a bowler selected.");
  }

  const calc = computeExtras(input);
  const overNumber = Math.floor(innings.legalBalls / 6);
  const ballInOver = calc.isLegal ? nextBallInOver(innings.currentOverEvents) : legalBallsInOver(innings.currentOverEvents) + 1;

  const event: BallEvent = {
    id: nextBallId(),
    timestamp: new Date().toISOString(),
    inningsNumber: innings.inningsNumber,
    overNumber,
    ballInOver,
    strikerName: innings.strikerName,
    nonStrikerName: innings.nonStrikerName,
    bowlerName: innings.currentBowlerName,
    runsBat: input.runsBat,
    extra: input.extra,
    extraRuns: input.extraRuns,
    isLegal: calc.isLegal,
    isFreeHit: innings.isFreeHit,
    wicket: input.wicket,
    totalRuns: calc.totalRuns,
  };

  // ---- Batters ----
  const batters = { ...innings.batters };
  batters[innings.strikerName] = applyBallToBatter(batters[innings.strikerName], calc.batterRuns, calc.isLegal);
  if (event.wicket) {
    batters[event.wicket.playerOut] = dismissBatter(batters[event.wicket.playerOut], event.wicket);
  }

  // ---- Bowler ----
  const tookWicket = Boolean(event.wicket) && bowlerCredited(event.wicket!.type);
  const bowlers = { ...innings.bowlers };
  bowlers[innings.currentBowlerName] = applyBallToBowler(bowlers[innings.currentBowlerName], calc.isLegal, calc.bowlerRuns, tookWicket);

  // ---- Partnership ----
  // The dismissal ball's runs still belong to the outgoing pair's
  // partnership; it closes immediately after so a fresh one can open once
  // the replacement batter is confirmed (see insertNewBatter below).
  const partnerships = [...innings.partnerships];
  if (partnerships.length > 0) {
    const last = partnerships.length - 1;
    partnerships[last] = applyBallToPartnership(partnerships[last], calc.totalRuns, event.isLegal);
    if (event.wicket) partnerships[last] = closePartnership(partnerships[last]);
  }

  // ---- Totals / fall of wickets ----
  const totalRuns = innings.totalRuns + calc.totalRuns;
  const totalWickets = innings.totalWickets + (event.wicket ? 1 : 0);
  const legalBalls = innings.legalBalls + (calc.isLegal ? 1 : 0);
  const extrasTotal = { ...innings.extrasTotal };
  if (input.extra) extrasTotal[input.extra] += calc.totalRuns - calc.batterRuns;

  const fallOfWickets = [...innings.fallOfWickets];
  if (event.wicket) {
    fallOfWickets.push({
      wicketNumber: totalWickets,
      teamRuns: totalRuns,
      overLabel: oversLabel(legalBalls),
      playerOut: event.wicket.playerOut,
      dismissal: event.wicket.type,
    });
  }

  // ---- Strike rotation (see file-level note on the wicket-slot simplification) ----
  let strikerName: string | null = innings.strikerName;
  let nonStrikerName: string | null = innings.nonStrikerName;
  if (event.wicket && event.wicket.playerOut === strikerName) {
    strikerName = null;
  } else if (event.wicket && event.wicket.playerOut === nonStrikerName) {
    nonStrikerName = null;
  } else if (calc.battersRun % 2 === 1) {
    [strikerName, nonStrikerName] = [nonStrikerName, strikerName];
  }

  // ---- Over completion ----
  const overEvents = [...innings.currentOverEvents, event];
  let currentOverEvents = overEvents;
  let completedOvers = innings.completedOvers;
  let previousOverBowlerName = innings.previousOverBowlerName;
  let currentBowlerName: string | null = innings.currentBowlerName;

  if (isOverComplete(overEvents)) {
    const overBowlerRuns = overEvents.reduce((sum, e) => sum + computeExtras(e).bowlerRuns, 0);
    if (overBowlerRuns === 0) {
      bowlers[innings.currentBowlerName] = applyMaiden(bowlers[innings.currentBowlerName]);
    }
    completedOvers = [...innings.completedOvers, overEvents];
    currentOverEvents = [];
    previousOverBowlerName = innings.currentBowlerName;
    currentBowlerName = null; // a new bowler must be selected before the next ball
    if (strikerName && nonStrikerName) {
      [strikerName, nonStrikerName] = [nonStrikerName, strikerName]; // ends change
    }
  }

  // ---- Free hit ----
  let isFreeHit: boolean;
  if (calc.isLegal) {
    isFreeHit = false;
  } else if (input.extra === "no-ball") {
    isFreeHit = options.freeHitEnabled;
  } else {
    isFreeHit = innings.isFreeHit;
  }

  const next: InningsState = {
    ...innings,
    status: "in-progress",
    totalRuns,
    totalWickets,
    legalBalls,
    extrasTotal,
    strikerName,
    nonStrikerName,
    currentBowlerName,
    previousOverBowlerName,
    isFreeHit,
    currentOverEvents,
    completedOvers,
    events: [...innings.events, event],
    batters,
    bowlers,
    fallOfWickets,
    partnerships,
  };

  return { innings: next, event };
}

/**
 * Penalty runs (e.g. for a fielding infraction) aren't tied to a delivery --
 * they don't touch overs, batters, or bowler figures, only the team total.
 * Simplification: always credited to the current batting side, the common
 * real-world case.
 */
export function applyPenalty(innings: InningsState, runs: number): ApplyBallResult {
  const event: BallEvent = {
    id: nextBallId(),
    timestamp: new Date().toISOString(),
    inningsNumber: innings.inningsNumber,
    overNumber: Math.floor(innings.legalBalls / 6),
    ballInOver: legalBallsInOver(innings.currentOverEvents),
    strikerName: innings.strikerName ?? "",
    nonStrikerName: innings.nonStrikerName ?? "",
    bowlerName: innings.currentBowlerName ?? "",
    runsBat: 0,
    extra: "penalty",
    extraRuns: runs,
    isLegal: true,
    isFreeHit: false,
    wicket: null,
    totalRuns: runs,
  };
  return {
    innings: {
      ...innings,
      totalRuns: innings.totalRuns + runs,
      extrasTotal: { ...innings.extrasTotal, penalty: innings.extrasTotal.penalty + runs },
      events: [...innings.events, event],
    },
    event,
  };
}

/**
 * Retired hurt / retired out -- a standalone declaration between deliveries,
 * not tied to a ball. Frees the batter's slot and closes the active
 * partnership exactly like a wicket does, without touching the bowler or
 * over count.
 */
export function applyRetirement(innings: InningsState, playerOut: string, type: "retired-hurt" | "retired-out"): ApplyBallResult {
  const batters = { ...innings.batters, [playerOut]: retireBatter(innings.batters[playerOut], type === "retired-out") };
  const strikerName = innings.strikerName === playerOut ? null : innings.strikerName;
  const nonStrikerName = innings.nonStrikerName === playerOut ? null : innings.nonStrikerName;
  const partnerships = [...innings.partnerships];
  if (partnerships.length > 0) partnerships[partnerships.length - 1] = closePartnership(partnerships[partnerships.length - 1]);

  const event: BallEvent = {
    id: nextBallId(),
    timestamp: new Date().toISOString(),
    inningsNumber: innings.inningsNumber,
    overNumber: Math.floor(innings.legalBalls / 6),
    ballInOver: legalBallsInOver(innings.currentOverEvents),
    strikerName: innings.strikerName ?? "",
    nonStrikerName: innings.nonStrikerName ?? "",
    bowlerName: innings.currentBowlerName ?? "",
    runsBat: 0,
    extra: null,
    extraRuns: 0,
    isLegal: true,
    isFreeHit: false,
    wicket: { type, playerOut },
    totalRuns: 0,
  };

  return {
    innings: { ...innings, batters, strikerName, nonStrikerName, partnerships, events: [...innings.events, event] },
    event,
  };
}

/** Fills whichever batter slot a wicket (or retirement) vacated, and opens a fresh partnership with the survivor. */
export function insertNewBatter(innings: InningsState, name: string): InningsState {
  const slot: "striker" | "non-striker" = innings.strikerName === null ? "striker" : "non-striker";
  const survivor = slot === "striker" ? innings.nonStrikerName : innings.strikerName;

  const batters = { ...innings.batters, [name]: createBatter(name, innings.battingOrder.length + 1) };
  const partnerships = [...innings.partnerships];
  if (survivor) {
    const [batterA, batterB] = slot === "striker" ? [name, survivor] : [survivor, name];
    partnerships.push(newPartnership(batterA, batterB, oversLabel(innings.legalBalls)));
  }

  return {
    ...innings,
    batters,
    battingOrder: [...innings.battingOrder, name],
    strikerName: slot === "striker" ? name : innings.strikerName,
    nonStrikerName: slot === "non-striker" ? name : innings.nonStrikerName,
    partnerships,
  };
}

/** Selects (or re-selects) the bowler for the upcoming over. */
export function setBowler(innings: InningsState, name: string): InningsState {
  const bowlers = { ...innings.bowlers };
  if (!bowlers[name]) bowlers[name] = createBowler(name);
  return { ...innings, bowlers, currentBowlerName: name };
}
