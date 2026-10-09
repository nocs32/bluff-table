import type { GameSnapshot, MemberSnapshot } from '@bluff-table/protocol';
import type { TableRoomGame } from './game/index.js';
import type { TableRoomMember } from './members.js';

// What the table looks like from outside: the shared view, the same for everyone. Hands and the
// whisper never go through here: each person's own secrets are added to their copy (spec D24,
// §10.4).

export interface TableRoomView {
  members: MemberSnapshot[];
  game: GameSnapshot;
}

export interface TableRoomViewParts {
  members: readonly TableRoomMember[];
  game: Pick<TableRoomGame, 'phase' | 'settings' | 'snapshot'>;
}

export const tableView = ({ members, game }: TableRoomViewParts): TableRoomView => ({
  members: members.map(({ id, name, color, connected, bot, character, wins }) => ({ id, name, color, connected, bot, character, wins })),
  game: { phase: game.phase, settings: game.settings, match: game.snapshot() },
});
