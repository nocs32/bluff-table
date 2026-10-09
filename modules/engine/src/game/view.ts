// What one seat may see and do (D24, §6): its own hand, the table card, every play's size,
// everyone's card counts and cylinders, and its whisper if it got one. Bots get exactly this, so
// they can't cheat.
import type { Card, PlaySize, TableRank } from '@bluff-table/protocol';
import { handOf, isForced, isOpening } from './table.js';
import type { GameState, Move, SeatId } from './types.js';

export interface SeatView {
  seat: SeatId;
  hand: Card[];
  tableRank: TableRank;
  deckSize: number;
  turn: SeatId;
  opening: boolean;
  forced: boolean;
  plays: PlaySize[];
  // Living players, in seating order, and how many cards each holds.
  alive: SeatId[];
  counts: Record<SeatId, number>;
  // Chambers each seat has pulled this game.
  used: Record<SeatId, number>;
  canDouble: boolean;
  // Who got the whisper this round, and, if it was this seat, whether the house is crooked.
  whispered: SeatId | null;
  crooked: boolean | null;
}

export const seatView = (state: GameState, seat: SeatId): SeatView => {
  const { round } = state;
  const house = round.house;

  return {
    seat,
    hand: [...handOf(round, seat)],
    tableRank: round.tableRank,
    deckSize: state.deck.length,
    turn: round.turn,
    opening: isOpening(round),
    forced: round.turn === seat && isForced(state),
    plays: round.plays.map((play) => ({ seat: play.seat, count: play.cards.length })),
    alive: [...state.alive],
    counts: Object.fromEntries(state.alive.map((other) => [other, handOf(round, other).length])),
    used: Object.fromEntries(state.seats.map((other) => [other, state.revolvers[other]?.used ?? 0])),
    canDouble: state.switches.doubleCall && !state.doubleUsed.includes(seat),
    whispered: house?.seat ?? null,
    crooked: house?.seat === seat ? house.crooked : null,
  };
};

// Every way to pick 1 to 3 cards from a hand.
const picks = (hand: readonly Card[]): string[][] => {
  const ids = hand.map((card) => card.id);
  const out: string[][] = [];

  ids.forEach((a, i) => {
    out.push([a]);

    ids.slice(i + 1).forEach((b, j) => {
      out.push([a, b]);
      ids.slice(i + j + 2).forEach((c) => out.push([a, b, c]));
    });
  });

  return out;
};

// Every move `seat` may make now.
export const legalMoves = (state: GameState, seat: SeatId): Move[] => {
  const { step, round } = state;

  if (step.kind === 'pull') return step.seat === seat ? [{ type: 'pull' }] : [];

  if (step.kind !== 'turn' || round.turn !== seat || !state.alive.includes(seat)) return [];

  const view = seatView(state, seat);
  const calls: Move[] = view.opening ? [] : [{ type: 'call', double: false }, ...(view.canDouble ? [{ type: 'call', double: true } as const] : [])];
  const plays: Move[] = view.forced ? [] : picks(view.hand).map((cardIds) => ({ type: 'play', cardIds }));

  return [...plays, ...calls];
};
