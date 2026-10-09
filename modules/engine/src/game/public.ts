// What everyone may see of a game, and what's private (D24, §10.4). The server and the demo
// table's referee both send exactly this, so the browser can't tell them apart (D28).
import type { GameSummary, PlayEvent, RoundSnapshot, RoundStep, SecretSnapshot } from '@bluff-table/protocol';
import { handOf, isForced, isOpening } from './table.js';
import type { GameEvent, GameState, SeatId } from './types.js';

// The engine's events as everyone may see them: a play's cards become a count, and the whisper
// becomes only who got it.
export const publicEvents = (events: readonly GameEvent[]): PlayEvent[] =>
  events.map((event): PlayEvent => {
    switch (event.type) {
      case 'dealt':
        return { type: 'dealt', round: event.round, tableRank: event.tableRank, first: event.first, whispered: event.house?.seat ?? null };
      case 'played':
        return { type: 'played', seat: event.seat, count: event.cards.length };
      default:
        return event;
    }
  });

// What a seat's person sees that nobody else does: their hand while alive; once dead, every hand,
// the leftover cards and every play's real cards; and the whisper, if it was to them. Someone not
// seated (a spectator) sees nothing private: otherwise a second tab could peek.
export const secretsFor = (state: GameState, seat: SeatId): SecretSnapshot => {
  const { round } = state;
  const seated = state.seats.includes(seat);
  const alive = state.alive.includes(seat);
  const over = state.step.kind === 'over';
  const ghost = seated && (!alive || over);

  return {
    hand: seated && alive ? [...handOf(round, seat)] : null,
    ghost: ghost ? { hands: Object.fromEntries(state.alive.map((other) => [other, [...handOf(round, other)]])), leftover: [...round.leftover], plays: round.plays.map((play) => ({ seat: play.seat, cards: [...play.cards] })) } : null,
    crooked: round.house?.seat === seat && !over && state.step.kind !== 'roundOver' ? round.house.crooked : null,
  };
};

// Where the round is, as everyone sees it. The room adds the steps the engine doesn't keep (the
// reveal and the beat before a pull's result) and when the current one ends.
export const roundSnapshot = (state: GameState, step: RoundStep, endsAt: number): RoundSnapshot => {
  const { round } = state;
  const gun = state.step.kind === 'pull' ? state.step : null;
  const over = state.step.kind === 'roundOver' || state.step.kind === 'over';
  const flipped = round.flipped === null ? null : round.plays[round.flipped];

  return {
    number: round.number,
    tableRank: round.tableRank,
    step,
    turn: round.turn,
    opening: isOpening(round),
    forced: state.step.kind === 'turn' && isForced(state),
    plays: round.plays.map((play) => ({ seat: play.seat, count: play.cards.length })),
    whispered: round.house?.seat ?? null,
    puller: gun ? { seat: gun.seat, pulls: gun.pulls, reason: gun.reason } : null,
    revealed: flipped ? [...flipped.cards] : null,
    flipped: round.flipped,
    house: over ? round.house : null,
    endsAt,
  };
};

export interface SeatState {
  id: SeatId;
  alive: boolean;
  cards: number;
  used: number;
  doubleUsed: boolean;
}

export const seatStates = (state: GameState): SeatState[] =>
  state.seats.map((id) => ({
    id,
    alive: state.alive.includes(id),
    cards: state.alive.includes(id) ? handOf(state.round, id).length : 0,
    used: state.revolvers[id]?.used ?? 0,
    doubleUsed: state.doubleUsed.includes(id),
  }));

// The end of a game (spec §4.4), once it's over.
export const gameSummary = (state: GameState): GameSummary | null =>
  state.step.kind === 'over' ? { winner: state.step.winner, deaths: [...state.deaths], boldest: state.boldest, bestCall: state.bestCall } : null;
