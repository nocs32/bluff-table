// A turn's moves (spec §5.4, §5.5, §5.8, §5.9): put 1–3 cards down, or call Liar! on the play
// before. They change the context's private copy of the state and record what happened.
import { gameLimits, type PlayCards, type PullReason } from '@bluff-table/protocol';
import { isTrue } from '../cards.js';
import { crookOf, handOf, isCrookTruthPending, isForced, lastPlay, nextWithCards } from './table.js';
import type { GameContext, MoveError, RoundState, SeatId } from './types.js';

// Whoever loses gets the gun: `pulls` times, for `reason`.
export const handGun = (ctx: GameContext, seat: SeatId, pulls: number, reason: PullReason): void => {
  ctx.state.step = { kind: 'pull', seat, pulls, reason };
  ctx.state.round.turn = seat;
  ctx.events.push({ type: 'mustPull', seat, pulls, reason });
};

// The crook told the truth and the next player moved without calling it: the barkeep flips the
// crook's play, and the crook pulls (spec §5.8).
const houseCheck = (ctx: GameContext, index: number, play: PlayCards): void => {
  ctx.state.round.flipped = index;
  ctx.events.push({ type: 'revealed', seat: play.seat, cards: play.cards, lie: false, by: 'house' });
  handGun(ctx, play.seat, 1, 'houseCheck');
};

// The cards with these ids from the hand, or null if any isn't there (or is named twice).
const pickCards = (round: RoundState, seat: SeatId, cardIds: readonly string[]): PlayCards | null => {
  const hand = handOf(round, seat);
  const cards = cardIds.map((id) => hand.find((card) => card.id === id));
  const unique = new Set(cardIds).size === cardIds.length;

  if (!unique || cardIds.length < 1 || cardIds.length > gameLimits.playMax || cards.some((card) => card === undefined)) return null;

  return { seat, cards: cards.filter((card) => card !== undefined) };
};

export const playCards = (ctx: GameContext, seat: SeatId, cardIds: readonly string[]): MoveError | null => {
  const { state } = ctx;
  const { round } = state;

  if (isForced(state)) return 'MUST_CALL';

  const play = pickCards(round, seat, cardIds);

  if (!play) return 'NOT_IN_HAND';

  const pending = isCrookTruthPending(round) ? lastPlay(round) : null;

  round.hands[seat] = handOf(round, seat).filter((card) => !cardIds.includes(card.id));
  round.plays.push(play);
  round.lastMover = seat;
  ctx.events.push({ type: 'played', seat, cards: play.cards });

  if (pending) houseCheck(ctx, round.plays.length - 2, pending);
  else round.turn = nextWithCards(state, seat);

  return null;
};

// Who pulls after a call (spec §5.5): the liar, or the caller who called the truth. Against the
// crook it's the other way round: their lies are safe, their truth gets them shot (§5.8).
const loserOf = (round: RoundState, caller: SeatId, play: PlayCards, lie: boolean): { seat: SeatId; reason: PullReason } => {
  if (play.seat === crookOf(round)) return lie ? { seat: caller, reason: 'calledCrook' } : { seat: play.seat, reason: 'crookTruth' };

  return lie ? { seat: play.seat, reason: 'lied' } : { seat: caller, reason: 'calledTruth' };
};

const doubleError = (ctx: GameContext, seat: SeatId): MoveError | null => {
  if (!ctx.state.switches.doubleCall) return 'DOUBLE_OFF';

  return ctx.state.doubleUsed.includes(seat) ? 'DOUBLE_USED' : null;
};

export const callLiar = (ctx: GameContext, seat: SeatId, double: boolean): MoveError | null => {
  const { state } = ctx;
  const { round } = state;
  const play = lastPlay(round);

  if (!play) return 'NOTHING_TO_CALL';

  const error = double ? doubleError(ctx, seat) : null;

  if (error) return error;

  const lie = !isTrue(play.cards, round.tableRank);
  const loser = loserOf(round, seat, play, lie);

  if (double) state.doubleUsed.push(seat);

  if (loser.seat !== seat && play.cards.length > (state.bestCall?.count ?? 0)) state.bestCall = { seat, count: play.cards.length };

  round.lastMover = seat;
  round.flipped = round.plays.length - 1;
  ctx.events.push({ type: 'called', seat, against: play.seat, double }, { type: 'revealed', seat: play.seat, cards: play.cards, lie, by: 'call' });
  handGun(ctx, loser.seat, double ? 2 : 1, loser.reason);

  return null;
};
