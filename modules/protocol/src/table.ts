import type { Card } from './cards.js';
import type { Character, Mood } from './characters.js';
import type { GamePhase, GameSettingKey, GameSettings, GameSwitch } from './game.js';
import type { PlayerColor } from './players.js';
import type { MatchSnapshot } from './round.js';

// What a table looks like to one person. The web app's stores read only these shapes, so the demo
// referee and the real server are interchangeable behind them (spec D28). Hands go to their owner
// alone (D24): only `SecretSnapshot` carries anyone's cards, and each person gets their own.

export interface MemberSnapshot {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
  // A bot fills a seat from the lobby and plays by the same rules (spec D9, §6).
  bot: boolean;
  // How they look (spec D7): random when they sit down, changed in the lobby.
  character: Character;
  // Games won tonight: their bounty on the wanted posters (D16).
  wins: number;
}

export interface GameSnapshot {
  phase: GamePhase;
  settings: GameSettings;
  // The game being played, or the one that just ended; null in the lobby.
  match: MatchSnapshot | null;
}

// A play's real cards, for ghosts.
export interface PlayCards {
  seat: string;
  cards: Card[];
}

// Every hand, the leftover cards and the plays' real cards: what ghosts see (spec §5.7).
export interface GhostSight {
  hands: Record<string, Card[]>;
  leftover: Card[];
  plays: PlayCards[];
}

// What only you may see (D24): your hand while you're alive, everything once you're a ghost, and
// the barkeep's whisper if it was to you.
export interface SecretSnapshot {
  hand: Card[] | null;
  ghost: GhostSight | null;
  // true: the house is crooked this round, and you're the crook; false: it's straight.
  crooked: boolean | null;
}

export const noSecrets: SecretSnapshot = { hand: null, ghost: null, crooked: null };

// What a system line says. Kept as data, so each viewer reads it in their own language.
export type FeedEvent =
  | { type: 'joined' }
  | { type: 'left' }
  | { type: 'renamed'; name: string }
  | { type: 'setting'; setting: GameSettingKey; value: number }
  | { type: 'switch'; name: GameSwitch; on: boolean }
  // Someone sat a bot down, or sent one away. `name` is the bot's.
  | { type: 'botAdded'; name: string }
  | { type: 'botRemoved'; name: string }
  // The game: the author dealt the cards, died in a round, or won (their bounty is now `bounty`).
  | { type: 'gameStarted' }
  | { type: 'died'; round: number }
  | { type: 'gameWon'; bounty: number };

interface FeedItemBase {
  id: string;
  authorId: string;
  // Their latest name and their colour, kept for when they're no longer at the table.
  authorName: string;
  authorColor: PlayerColor;
  at: number;
}

export type FeedItem = (FeedItemBase & { kind: 'message'; text: string }) | (FeedItemBase & { kind: 'system'; event: FeedEvent });

export interface TableSnapshot {
  members: MemberSnapshot[];
  game: GameSnapshot;
  feed: FeedItem[];
  secret: SecretSnapshot;
}

export interface TableReactionEvent {
  memberId: string;
  emoji: string;
}

// Where someone's head points (spec §7.1), passed on to everyone else at the table. `x` is the
// place round the table they look at, from their own seat: 0 straight across, -1 and 1 all the way
// round to their own place, each way. `y` is up (1, the lamp) or down (-1, their cards).
export interface TableLookEvent {
  memberId: string;
  x: number;
  y: number;
}

// The face someone pulls (spec §7.2).
export interface TableFaceEvent {
  memberId: string;
  mood: Mood;
}

// Feed lines a table keeps (and a browser shows); the oldest go first.
export const feedMaxItems = 200;
