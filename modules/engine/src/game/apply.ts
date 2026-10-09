// A move, checked and worked out on a private copy of the state (spec §10.3). The server, the
// demo table and the simulations all go through here, so they can never disagree.
import { callLiar, playCards } from './moves.js';
import { pullTrigger } from './pull.js';
import { handOf, isForced } from './table.js';
import type { GameContext, GameState, Move, MoveError, MoveResult, SeatId } from './types.js';

const turnError = (state: GameState, seat: SeatId): MoveError | null => {
  if (!state.alive.includes(seat)) return 'NOT_PLAYING';

  if (state.step.kind !== 'turn') return 'WRONG_PHASE';

  return state.round.turn === seat ? null : 'NOT_YOUR_TURN';
};

const run = (ctx: GameContext, seat: SeatId, move: Move): MoveError | null => {
  if (move.type === 'pull') return ctx.state.alive.includes(seat) ? pullTrigger(ctx, seat) : 'NOT_PLAYING';

  const error = turnError(ctx.state, seat);

  if (error) return error;

  return move.type === 'play' ? playCards(ctx, seat, move.cardIds) : callLiar(ctx, seat, move.double);
};

// The state is plain data, so a copy through JSON is a full one.
const copy = (state: GameState): GameState => JSON.parse(JSON.stringify(state)) as GameState;

export const applyMove = (current: GameState, seat: SeatId, move: Move, random: () => number): MoveResult => {
  const ctx: GameContext = { state: copy(current), events: [], random };
  const error = run(ctx, seat, move);

  return error ? { ok: false, error } : { ok: true, state: ctx.state, events: ctx.events };
};

// What the table does for someone out of time (spec D14, §5.6): a random card from their hand, or
// their forced call; or, with the gun out, the pull.
export const timeoutMove = (current: GameState, random: () => number): { seat: SeatId; move: Move } | null => {
  const { step, round } = current;

  if (step.kind === 'pull') return { seat: step.seat, move: { type: 'pull' } };

  if (step.kind !== 'turn') return null;

  const hand = handOf(round, round.turn);
  const card = hand[Math.floor(random() * hand.length)];

  if (isForced(current) || !card) return { seat: round.turn, move: { type: 'call', double: false } };

  return { seat: round.turn, move: { type: 'play', cardIds: [card.id] } };
};
