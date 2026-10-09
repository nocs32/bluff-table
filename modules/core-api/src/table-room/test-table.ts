import { TableRoomBots } from './bots.js';
import { TableRoomFeed } from './feed.js';
import { TableRoomGame } from './game.js';
import { TableRoomMembers } from './members.js';

export interface TestTable {
  game: TableRoomGame;
  members: TableRoomMembers;
  feed: TableRoomFeed;
  bots: TableRoomBots;
}

// A table with `people` sitting at it (ids p0, p1, …).
export const createTestTable = (people = 3): TestTable => {
  const members = new TableRoomMembers(() => 0);
  let lines = 0;
  let bots = 0;
  const feed = new TableRoomFeed({ now: () => 0, createId: () => `line-${++lines}`, maxItems: 200 });
  const game = new TableRoomGame({ members, feed });
  const seats = new TableRoomBots({ members, feed, game, createId: () => String(++bots) });

  Array.from({ length: people }, (_, index) => members.join(`p${index}`, `Player ${index}`));

  return { game, members, feed, bots: seats };
};
