import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { createTestTable, type TestTable } from './test-table.js';

const events = (table: TestTable): unknown[] => table.feed.items.map((item) => (item.kind === 'system' ? item.event : null));

test('anyone may sit a bot down; it gets a bot name and a feed line', () => {
  const table = createTestTable(2);
  const bot = table.bots.add('p1');

  expect(bot).toEqual({ id: 'bot-1', name: 'Dusty', color: expect.any(String), connected: true, bot: true });
  expect(table.members.count).toBe(3);
  expect(table.members.people).toBe(2);
  expect(events(table)).toEqual([{ type: 'botAdded', name: 'Dusty' }]);
});

test('bots fill free seats only, and only bots can be sent away', () => {
  const table = createTestTable(2);

  [1, 2, 3, 4].forEach(() => table.bots.add('p0'));
  expect(() => table.bots.add('p0')).toThrow(new TableRoomError('TABLE_FULL'));
  expect(() => table.bots.remove('p0', 'p1')).toThrow(new TableRoomError('NOT_A_BOT'));

  table.bots.remove('p1', 'bot-2');
  expect(table.members.all.map((member) => member.name)).toEqual(['Player 0', 'Player 1', 'Dusty', 'Hank', 'Clem']);
  expect(events(table).at(-1)).toEqual({ type: 'botRemoved', name: 'Slim' });
});

test('someone arriving at a full table takes the newest bot’s seat', () => {
  const table = createTestTable(1);

  [1, 2, 3, 4, 5].forEach(() => table.bots.add('p0'));
  table.bots.makeRoom();

  expect(table.members.count).toBe(5);
  expect(table.members.newestBot?.name).toBe('Clem');
  expect(events(table).at(-1)).toEqual({ type: 'left' });
});

test('a table with room, or without bots, makes no room', () => {
  const table = createTestTable(3);

  table.bots.makeRoom();
  expect(table.members.count).toBe(3);
});
