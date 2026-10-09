// A game (spec §4.3, §5): the whole truth, kept by the server (or the demo table's referee) and
// never sent whole. Each person is sent only what they may see (D24, §10.4).
import type { Card, GameSwitches, House, PlayCards, PlaySize, PullReason, TableRank } from '@bluff-table/protocol';

// A seat at the table: the member id of whoever sits in it, person or bot.
export type SeatId = string;

// Everyone's own six-shooter (D15): where the one bullet is (0 to 5, never sent), and how many
// chambers have been pulled. The bullet fires on the pull that reaches it.
export interface Revolver {
  bullet: number;
  used: number;
}

export interface RoundState {
  // From 1.
  number: number;
  tableRank: TableRank;
  hands: Record<SeatId, Card[]>;
  // The cards nobody was dealt: face down, out of play.
  leftover: Card[];
  turn: SeatId;
  // Every play this round, oldest first. The last one can be called.
  plays: PlayCards[];
  // The barkeep's whisper, when the switch is on (spec §5.8).
  house: House | null;
  // Which play was flipped (called, or checked by the house), by its place in `plays`.
  flipped: number | null;
  // Who played or called last: the next round starts after them (D12).
  lastMover: SeatId | null;
}

// Where the game is: someone's turn; someone with the gun out (`pulls` left to make); between
// rounds; or over.
export type GameStep = { kind: 'turn' } | { kind: 'pull'; seat: SeatId; pulls: number; reason: PullReason } | { kind: 'roundOver' } | { kind: 'over'; winner: SeatId };

export interface GameState {
  // Seating order, round the table to the left.
  seats: SeatId[];
  // Who's still alive, in seating order.
  alive: SeatId[];
  revolvers: Record<SeatId, Revolver>;
  // Who has made their double call this game (spec §5.9).
  doubleUsed: SeatId[];
  switches: GameSwitches;
  deck: Card[];
  round: RoundState;
  step: GameStep;
  // Who got the whisper last round: never twice in a row.
  lastWhispered: SeatId | null;
  // For the summary at the end (spec §4.4).
  deaths: Array<{ seat: SeatId; round: number }>;
  boldest: PlaySize | null;
  bestCall: PlaySize | null;
}

// What happened, in order: the server turns these into what each person is sent, and the browser
// into animations (spec §10.2). Hands and played cards are private until they're flipped.
export type GameEvent =
  | { type: 'dealt'; round: number; tableRank: TableRank; first: SeatId; house: House | null }
  | { type: 'played'; seat: SeatId; cards: Card[] }
  | { type: 'called'; seat: SeatId; against: SeatId; double: boolean }
  | { type: 'revealed'; seat: SeatId; cards: Card[]; lie: boolean; by: 'call' | 'house' }
  | { type: 'mustPull'; seat: SeatId; pulls: number; reason: PullReason }
  | { type: 'pulled'; seat: SeatId; bang: boolean; used: number }
  | { type: 'roundOver'; house: House | null }
  | { type: 'gameOver'; winner: SeatId };

// What a player asks to do. The engine works out the result (spec §10.3).
export type Move = { type: 'play'; cardIds: string[] } | { type: 'call'; double: boolean } | { type: 'pull' };

export type MoveError = 'NOT_PLAYING' | 'NOT_YOUR_TURN' | 'NOT_IN_HAND' | 'NOTHING_TO_CALL' | 'MUST_CALL' | 'DOUBLE_USED' | 'DOUBLE_OFF' | 'WRONG_PHASE';

export type MoveResult = { ok: true; state: GameState; events: GameEvent[] } | { ok: false; error: MoveError };

// A move being worked out: a private copy of the state to change, and what happened so far.
export interface GameContext {
  state: GameState;
  events: GameEvent[];
  random: () => number;
}
