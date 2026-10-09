import type { Character, GamePhase, GameSettings, MatchSnapshot, PlayerColor, SecretSnapshot } from '@bluff-table/protocol';
import type { Schedule } from '../types';

export interface DemoDeps {
  schedule: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
}

// The language a sample player chats in.
export type DemoLanguage = 'en' | 'uk';

export interface DemoMember {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
  // A bot sat down from the lobby (🤖), as at a live table.
  bot: boolean;
  // A sample player: stands in for a person at the demo table, and says hello.
  sample: boolean;
  language: DemoLanguage;
  character: Character;
  // Games won tonight (spec D16).
  wins: number;
}

// The parts of the table that the views read.
export interface DemoTableState {
  readonly members: readonly DemoMember[];
  readonly phase: GamePhase;
  readonly settings: GameSettings;
  readonly match: MatchSnapshot | null;
  secretFor: (memberId: string) => SecretSnapshot;
}
