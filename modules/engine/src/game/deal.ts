// Dealing (spec §5.2, §5.3): a game's revolvers and first player, and each round's table card,
// hands and whisper.
import { gameLimits, handSize, tableRanks, type Card, type GameSwitches, type House } from '@bluff-table/protocol';
import { buildDeck } from '../cards.js';
import { shuffle } from '../random.js';
import { nextAlive } from './table.js';
import type { GameEvent, GameState, Revolver, RoundState, SeatId } from './types.js';

// The house is crooked one round in three (spec §5.8).
export const crookedOdds = 1 / 3;

const pick = <T>(items: readonly T[], random: () => number): T => items[Math.floor(random() * items.length)] as T;

// The barkeep whispers to one living player, never the same one twice in a row (with two alive,
// it alternates).
const whisper = (state: GameState, random: () => number): House | null => {
  if (!state.switches.whisper) return null;

  const others = state.alive.filter((seat) => seat !== state.lastWhispered);
  const seat = pick(others.length > 0 ? others : state.alive, random);

  return { seat, crooked: random() < crookedOdds };
};

// Every living player gets five cards from the shuffled deck; the rest stay face down.
const dealHands = (deck: readonly Card[], alive: readonly SeatId[], random: () => number): { hands: Record<SeatId, Card[]>; leftover: Card[] } => {
  const shuffled = shuffle(deck, random);
  const hands = Object.fromEntries(alive.map((seat, index) => [seat, shuffled.slice(index * handSize, (index + 1) * handSize)]));

  return { hands, leftover: shuffled.slice(alive.length * handSize) };
};

// A new round, started by `first`.
export const dealRound = (state: GameState, first: SeatId, random: () => number): { state: GameState; events: GameEvent[] } => {
  const number = state.round.number + 1;
  const house = whisper(state, random);
  const round: RoundState = { number, tableRank: pick(tableRanks, random), ...dealHands(state.deck, state.alive, random), turn: first, plays: [], house, flipped: null, lastMover: null };
  const next: GameState = { ...state, round, step: { kind: 'turn' }, lastWhispered: house?.seat ?? state.lastWhispered };

  return { state: next, events: [{ type: 'dealt', round: number, tableRank: round.tableRank, first, house }] };
};

// The next round starts with the next living player after whoever moved last (D12).
export const nextRound = (state: GameState, random: () => number): { state: GameState; events: GameEvent[] } | null => {
  if (state.step.kind !== 'roundOver') return null;

  const last = state.round.lastMover ?? state.round.turn;

  return dealRound(state, nextAlive(state, last), random);
};

export interface StartOptions {
  // Everyone at the table, in seating order.
  seats: readonly SeatId[];
  switches: GameSwitches;
  random: () => number;
}

const loadRevolver = (random: () => number): Revolver => ({ bullet: Math.floor(random() * gameLimits.chambers), used: 0 });

// A new game: a fresh revolver each with one bullet in a random chamber (D15), the deck for the
// table's size (D10), a random first player (D13), and the first deal.
export const startGame = ({ seats, switches, random }: StartOptions): { state: GameState; events: GameEvent[] } => {
  const empty: RoundState = { number: 0, tableRank: 'king', hands: {}, leftover: [], turn: seats[0] ?? '', plays: [], house: null, flipped: null, lastMover: null };

  const state: GameState = {
    seats: [...seats],
    alive: [...seats],
    revolvers: Object.fromEntries(seats.map((seat) => [seat, loadRevolver(random)])),
    doubleUsed: [],
    switches: { ...switches },
    deck: buildDeck(seats.length),
    round: empty,
    step: { kind: 'roundOver' },
    lastWhispered: null,
    deaths: [],
    boldest: null,
    bestCall: null,
  };

  return dealRound(state, pick(seats, random), random);
};
