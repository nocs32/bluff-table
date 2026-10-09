// Whole games played by bots (spec §11): every game must end with one winner, never get stuck,
// and never lose or make up a card. They also measure how long games last and how the twists
// play out.
import { gameLimits, type GameSwitches } from '@bluff-table/protocol';
import { botMove, randomMove, type BotPersonality } from '../bots.js';
import { applyMove } from './apply.js';
import { nextRound, startGame } from './deal.js';
import { handOf } from './table.js';
import type { GameEvent, GameState, Move, SeatId } from './types.js';
import { seatView } from './view.js';

export type Brain = 'random' | BotPersonality;

export interface SimulatedGame {
  winner: SeatId;
  rounds: number;
  moves: number;
  // Crooked rounds, and how many the crook came out of alive.
  crooked: number;
  crookSurvived: number;
}

// A game can't take more moves than this: six pulls each at most, and a handful of moves a round.
const moveLimit = 4000;

const think = (state: GameState, brains: Record<SeatId, Brain>, random: () => number): { seat: SeatId; move: Move } => {
  const { step } = state;

  if (step.kind === 'pull') return { seat: step.seat, move: { type: 'pull' } };

  const seat = state.round.turn;
  const view = seatView(state, seat);
  const brain = brains[seat] ?? 'random';

  return { seat, move: brain === 'random' ? randomMove(view, random) : botMove(view, brain, random) };
};

// Every card is somewhere: in a hand, on the pile or left over.
export const cardCount = (state: GameState): number =>
  state.alive.reduce((sum, seat) => sum + handOf(state.round, seat).length, 0) + state.round.plays.reduce((sum, play) => sum + play.cards.length, 0) + state.round.leftover.length + dealtToTheDead(state);

const dealtToTheDead = (state: GameState): number => state.seats.filter((seat) => !state.alive.includes(seat)).reduce((sum, seat) => sum + handOf(state.round, seat).length, 0);

const check = (state: GameState): void => {
  if (cardCount(state) !== state.deck.length) throw new Error(`cards went missing: ${cardCount(state)} of ${state.deck.length}`);

  if (Object.values(state.revolvers).some((revolver) => revolver.used > gameLimits.chambers)) throw new Error('a revolver fired more than six times');
};

const tally = (events: readonly GameEvent[], state: GameState, game: SimulatedGame): void => {
  events.forEach((event) => {
    if (event.type === 'dealt') game.rounds += 1;

    if (event.type === 'dealt' && event.house?.crooked) game.crooked += 1;

    if (event.type === 'roundOver' && event.house?.crooked && state.alive.includes(event.house.seat)) game.crookSurvived += 1;
  });
};

// One step of the game: the next deal between rounds, or someone's move.
const advance = (state: GameState, brains: Record<SeatId, Brain>, random: () => number): { state: GameState; events: GameEvent[] } => {
  if (state.step.kind === 'roundOver') {
    const next = nextRound(state, random);

    if (!next) throw new Error('no next round');

    return next;
  }

  const { seat, move } = think(state, brains, random);
  const result = applyMove(state, seat, move, random);

  if (!result.ok) throw new Error(`a bot made a bad move: ${JSON.stringify(move)} (${result.error})`);

  return result;
};

export const simulateGame = (brains: Record<SeatId, Brain>, switches: GameSwitches, random: () => number): SimulatedGame => {
  const game: SimulatedGame = { winner: '', rounds: 0, moves: 0, crooked: 0, crookSurvived: 0 };
  let { state, events } = startGame({ seats: Object.keys(brains), switches, random });

  tally(events, state, game);

  for (; game.moves < moveLimit; game.moves++) {
    if (state.step.kind === 'over') return { ...game, winner: state.step.winner };

    ({ state, events } = advance(state, brains, random));
    tally(events, state, game);
    check(state);
  }

  throw new Error('the game got stuck');
};
