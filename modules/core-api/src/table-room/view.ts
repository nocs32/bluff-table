import type { GameSnapshot, MemberSnapshot } from '@bluff-table/protocol';
import type { TableRoomGame } from './game.js';
import type { TableRoomMember } from './members.js';

// What the table looks like from outside: the shared view, the same for everyone. Hands will go
// only to their owner (spec D24, §10.4), never through here. Wins and the game come to live
// tables in M2.

export interface TableRoomView {
  members: MemberSnapshot[];
  game: GameSnapshot;
}

export interface TableRoomViewParts {
  members: readonly TableRoomMember[];
  game: Pick<TableRoomGame, 'phase' | 'settings'>;
}

export const tableView = ({ members, game }: TableRoomViewParts): TableRoomView => ({
  members: members.map(({ id, name, color, connected, bot, character }) => ({ id, name, color, connected, bot, character, wins: 0 })),
  game: { phase: game.phase, settings: game.settings, match: null },
});
