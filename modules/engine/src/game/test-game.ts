// A game set up by hand for the tests: who holds what, whose turn, what's on the pile.
import type { Card, CardRank, GameSwitches, House, TableRank } from '@bluff-table/protocol';
import { buildDeck } from '../cards.js';
import type { GameState, SeatId } from './types.js';

let made = 0;

// A card of `rank` with an id of its own.
export const card = (rank: CardRank): Card => {
  made += 1;

  return { id: `t${made}`, rank };
};

export const cards = (...ranks: CardRank[]): Card[] => ranks.map(card);

export interface TestGame {
  hands: Record<SeatId, Card[]>;
  tableRank?: TableRank;
  turn?: SeatId;
  plays?: Array<{ seat: SeatId; cards: Card[] }>;
  dead?: SeatId[];
  house?: House | null;
  // Where each seat's bullet is, and how many chambers they've pulled.
  bullets?: Record<SeatId, number>;
  used?: Record<SeatId, number>;
  switches?: Partial<GameSwitches>;
}

export const testGame = ({ hands, tableRank = 'queen', turn, plays = [], dead = [], house = null, bullets = {}, used = {}, switches = {} }: TestGame): GameState => {
  const seats = Object.keys(hands);

  return {
    seats,
    alive: seats.filter((seat) => !dead.includes(seat)),
    revolvers: Object.fromEntries(seats.map((seat) => [seat, { bullet: bullets[seat] ?? 5, used: used[seat] ?? 0 }])),
    doubleUsed: [],
    switches: { whisper: false, doubleCall: false, ...switches },
    deck: buildDeck(seats.length),
    round: { number: 1, tableRank, hands, leftover: [], turn: turn ?? seats[0] ?? '', plays, house, flipped: null, lastMover: plays.at(-1)?.seat ?? null },
    step: { kind: 'turn' },
    lastWhispered: house?.seat ?? null,
    deaths: [],
    boldest: null,
    bestCall: null,
  };
};

// Never random: the first of everything.
export const steady = (): number => 0;
