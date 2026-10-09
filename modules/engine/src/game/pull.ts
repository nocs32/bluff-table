// The pull (spec §5.6): click or bang, a death, the end of a round and the end of the game.
import { liesIn } from '../cards.js';
import type { GameContext, MoveError, SeatId } from './types.js';

// The round is over: the boldest lie that got away is remembered for the summary (spec §4.4),
// and the house is shown to everyone (spec §5.8).
const endRound = (ctx: GameContext): void => {
  const { state } = ctx;
  const { round } = state;

  round.plays.forEach((play, index) => {
    const lies = liesIn(play.cards, round.tableRank);

    if (index !== round.flipped && lies > (state.boldest?.count ?? 0)) state.boldest = { seat: play.seat, count: lies };
  });

  state.step = { kind: 'roundOver' };
  ctx.events.push({ type: 'roundOver', house: round.house });
};

// Dead: a ghost for the rest of the game (spec §5.7). The last one alive wins, at once, even in
// the middle of a double call.
const die = (ctx: GameContext, seat: SeatId): void => {
  const { state } = ctx;

  state.alive = state.alive.filter((other) => other !== seat);
  state.deaths.push({ seat, round: state.round.number });
  endRound(ctx);

  const [winner] = state.alive;

  if (state.alive.length === 1 && winner !== undefined) {
    state.step = { kind: 'over', winner };
    ctx.events.push({ type: 'gameOver', winner });
  }
};

export const pullTrigger = (ctx: GameContext, seat: SeatId): MoveError | null => {
  const { state } = ctx;
  const step = state.step;
  const revolver = state.revolvers[seat];

  if (step.kind !== 'pull' || !revolver) return 'WRONG_PHASE';

  if (step.seat !== seat) return 'NOT_YOUR_TURN';

  const bang = revolver.used === revolver.bullet;

  revolver.used += 1;
  ctx.events.push({ type: 'pulled', seat, bang, used: revolver.used });

  if (bang) die(ctx, seat);
  else if (step.pulls > 1) state.step = { ...step, pulls: step.pulls - 1 };
  else endRound(ctx);

  return null;
};
