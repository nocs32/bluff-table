import type { Character, Mood } from './characters.js';
import type { GamePhase, GameSettingKey, GameSettings, GameSwitch } from './game.js';
import type { PlayerColor } from './players.js';

// What a table looks like to one person. The web app's stores read only these shapes, so the demo
// referee and the real server are interchangeable behind them (spec D28). Hands will be sent to
// their owner alone (D24): no shape here carries anyone's cards.

export interface MemberSnapshot {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
  // A bot fills a seat from the lobby and plays by the same rules (spec D9, §6).
  bot: boolean;
  // How they look (spec D7): random when they sit down, changed in the lobby.
  character: Character;
}

export interface GameSnapshot {
  phase: GamePhase;
  settings: GameSettings;
}

// What a system line says. Kept as data, so each viewer reads it in their own language.
export type FeedEvent =
  | { type: 'joined' }
  | { type: 'left' }
  | { type: 'renamed'; name: string }
  | { type: 'setting'; setting: GameSettingKey; value: number }
  | { type: 'switch'; name: GameSwitch; on: boolean }
  // Someone sat a bot down, or sent one away. `name` is the bot's.
  | { type: 'botAdded'; name: string }
  | { type: 'botRemoved'; name: string };

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
