// A game and its rounds as people see them (spec §5, §10.4). Nobody sees another living player's
// hand (D24): seats carry a card count, a play's cards only once they're called and flipped, and
// nobody ever sees where a bullet is.
import type { Card, TableRank } from './cards.js';
import type { Character } from './characters.js';
import type { PlayerColor } from './players.js';

// Where a round is (spec §10.3): someone's turn; the called cards flipping one at a time; someone
// with their gun out, waiting for them to pull; the beat after they press, before the click or the
// bang; and the round's end, before the next deal.
export type RoundStep = 'turn' | 'reveal' | 'pull' | 'pulling' | 'roundOver';

// Why someone pulls the trigger (spec §5.5, §5.8): caught lying, called the truth, a crook caught
// telling the truth (called, or by the house), or called a crook's lie.
export type PullReason = 'lied' | 'calledTruth' | 'crookTruth' | 'houseCheck' | 'calledCrook';

// The whisper (spec §5.8): who the barkeep whispered to this round, and what he said. The house
// is shown to everyone once the round ends; until then only the whispered player knows it.
export interface House {
  seat: string;
  crooked: boolean;
}

// A seat in the game, as everyone sees it.
export interface SeatSnapshot {
  // The member in it, and how they look (kept for the game if they leave).
  id: string;
  name: string;
  color: PlayerColor;
  character: Character;
  alive: boolean;
  // How many cards they hold, never which.
  cards: number;
  // Chambers they've pulled this game (spec D15): the bullet's place is never sent.
  used: number;
  // They've made their double call this game (spec §5.9).
  doubleUsed: boolean;
  // A bot is playing the seat: its person dropped out, or ran out of time twice in a row (§4.5).
  standIn: boolean;
}

// The play on top of the pile: who put it down and how many cards it claims.
export interface PlaySize {
  seat: string;
  count: number;
}

// Whoever has the gun out, and how many pulls they have to make (2 after a double call).
export interface Puller {
  seat: string;
  pulls: number;
  reason: PullReason;
}

// The round in progress, the same for everyone.
export interface RoundSnapshot {
  // The round's number in this game, from 1.
  number: number;
  tableRank: TableRank;
  step: RoundStep;
  // Whose turn it is (on `turn`), or who's pulling (on the gun's steps).
  turn: string;
  // The round's first turn: nothing to call yet.
  opening: boolean;
  // The player whose turn it is has the only cards left, so they must call (spec §5.4).
  forced: boolean;
  // Every play this round, oldest first; the last can be called.
  plays: PlaySize[];
  // Who the barkeep whispered to this round, when the whisper is on.
  whispered: string | null;
  puller: Puller | null;
  // The called (or house-checked) play's cards, face up, while they flip and after, and which play
  // in `plays` they are.
  revealed: Card[] | null;
  flipped: number | null;
  // What the house was, once the round is over.
  house: House | null;
  // When this step ends, on the server's clock: the turn's time, the gun's 10 seconds, the beat.
  endsAt: number;
}

// The end of a game (spec §4.4): who won, who died in which round, the boldest lie that got away,
// and the best call.
export interface GameSummary {
  winner: string;
  deaths: Array<{ seat: string; round: number }>;
  boldest: PlaySize | null;
  bestCall: PlaySize | null;
}

export interface MatchSnapshot {
  // 20 or 30 cards (D10).
  deckSize: number;
  seats: SeatSnapshot[];
  round: RoundSnapshot | null;
  summary: GameSummary | null;
}

// What just happened at the table, in order, for everyone: animations, sounds and captions.
export type PlayEvent =
  | { type: 'dealt'; round: number; tableRank: TableRank; first: string; whispered: string | null }
  | { type: 'played'; seat: string; count: number }
  | { type: 'called'; seat: string; against: string; double: boolean }
  // The called play's cards flip; `by` the house is the barkeep catching a crook's truth (§5.8).
  | { type: 'revealed'; seat: string; cards: Card[]; lie: boolean; by: 'call' | 'house' }
  | { type: 'mustPull'; seat: string; pulls: number; reason: PullReason }
  | { type: 'pulling'; seat: string }
  | { type: 'pulled'; seat: string; bang: boolean; used: number }
  | { type: 'roundOver'; house: House | null }
  | { type: 'gameOver'; winner: string }
  // Out of time: the table played a card for them, made their forced call, or pulled for them.
  | { type: 'timedOut'; seat: string; step: RoundStep };

// The table's pace, kept by the server and the demo table alike, so the browser's animations fit
// (spec §5.6, §8.4).
export const gamePace = {
  // The called cards flip one at a time.
  revealCardMs: 650,
  revealTailMs: 1100,
  // The gun's time before it pulls by itself (D15).
  pullMs: 10_000,
  // The random wait after the press, before the click or the bang.
  beatMs: { min: 1000, max: 3000 },
  // How long the round's end shows before the next deal: longer after a death.
  afterClickMs: 3500,
  afterBangMs: 6000,
  // A bot's think, and a bot's nervous wait before it pulls.
  botThinkMs: { min: 1100, max: 3000 },
  botPullMs: { min: 1600, max: 4000 },
} as const;

// How long the reveal of `count` cards lasts.
export const revealMs = (count: number): number => count * gamePace.revealCardMs + gamePace.revealTailMs;
