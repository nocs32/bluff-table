import type { TableSnapshot } from '@bluff-table/protocol';
import type { DemoFeed } from './feed';
import type { DemoTableState } from './types';

// The table as you see it: who's here, the game, and the chat.
export const snapshotFor = (table: DemoTableState, feed: DemoFeed): TableSnapshot => ({
  members: table.members.map(({ id, name, color, connected, bot, character }) => ({ id, name, color, connected, bot, character })),
  game: { phase: table.phase, settings: table.settings },
  feed: feed.items,
});
