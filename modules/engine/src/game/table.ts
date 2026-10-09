// Who sits where and who's next (spec §5.3, §5.4): turns go round the table to the left, skipping
// the dead and anyone with no cards left.
import type { Card, PlayCards } from '@bluff-table/protocol';
import { isTrue } from '../cards.js';
import type { GameState, RoundState, SeatId } from './types.js';

export const handOf = (round: RoundState, seat: SeatId): readonly Card[] => round.hands[seat] ?? [];

// The seats after `from` round the table, in order, ending with `from` itself.
const roundFrom = (seats: readonly SeatId[], from: SeatId): SeatId[] => {
  const at = seats.indexOf(from);

  return at < 0 ? [...seats] : [...seats.slice(at + 1), ...seats.slice(0, at + 1)];
};

// The next living player after `from` (who may be dead by now): the next round's first (D12).
export const nextAlive = (state: GameState, from: SeatId): SeatId => roundFrom(state.seats, from).find((seat) => state.alive.includes(seat)) ?? state.alive[0] ?? from;

// The next living player after `from` who still has cards: whose turn it is after a play.
export const nextWithCards = (state: GameState, from: SeatId): SeatId =>
  roundFrom(state.seats, from).find((seat) => state.alive.includes(seat) && handOf(state.round, seat).length > 0) ?? from;

// The play on top of the pile: the one a call is about.
export const lastPlay = (round: RoundState): PlayCards | null => round.plays.at(-1) ?? null;

// The round's first turn: nothing to call yet.
export const isOpening = (round: RoundState): boolean => round.plays.length === 0;

// The player whose turn it is holds the only cards left: they must call (spec §5.4).
export const isForced = (state: GameState): boolean => {
  const { turn } = state.round;

  return !isOpening(state.round) && state.alive.every((seat) => seat === turn || handOf(state.round, seat).length === 0);
};

// The crook this round, if the house is crooked (spec §5.8).
export const crookOf = (round: RoundState): SeatId | null => (round.house?.crooked ? round.house.seat : null);

// The crook's last play told the truth and nobody has called it yet: the next move gets it
// checked by the house (spec §5.8).
export const isCrookTruthPending = (round: RoundState): boolean => {
  const play = lastPlay(round);

  return play !== null && play.seat === crookOf(round) && isTrue(play.cards, round.tableRank);
};

// The odds of the next pull firing, as the chambers left: 6 for a fresh cylinder, 1 when it's
// certain.
export const chambersLeft = (state: GameState, seat: SeatId, chambers: number): number => chambers - (state.revolvers[seat]?.used ?? 0);
