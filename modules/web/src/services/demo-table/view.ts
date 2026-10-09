import type { TableSnapshot } from '@bluff-table/protocol';
import type { DemoFeed } from './feed';
import type { DemoTableState } from './types';

// The table as `viewerId` sees it: who's here, the game, the chat, and what only they may see.
export const snapshotFor = (table: DemoTableState, feed: DemoFeed, viewerId: string): TableSnapshot => ({
  members: table.members.map(({ id, name, color, connected, bot, character, wins }) => ({ id, name, color, connected, bot, character, wins })),
  game: { phase: table.phase, settings: table.settings, match: table.match },
  feed: feed.items,
  secret: table.secretFor(viewerId),
});
