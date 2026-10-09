import { defaultGameSettings } from '@bluff-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { createTestTable, type TestTable } from './test-table.js';
import { tableView } from './view.js';

const systemLines = ({ feed }: TestTable): unknown[] => feed.items.map((item) => (item.kind === 'system' ? item.event : null));

test('a new table waits in the lobby with the default settings', () => {
  const { game, members } = createTestTable(2);

  expect(tableView({ members: members.all, game }).game).toEqual({ phase: 'lobby', settings: defaultGameSettings, match: null });
});

test('anyone may change the settings; each change is clamped and gets a feed line', () => {
  const table = createTestTable(2);

  table.game.updateSettings('p1', { turnSeconds: 7, switches: { doubleCall: true } });

  expect(table.game.settings).toEqual({ turnSeconds: 15, switches: { whisper: false, doubleCall: true } });

  expect(systemLines(table)).toEqual([
    { type: 'setting', setting: 'turnSeconds', value: 15 },
    { type: 'switch', name: 'doubleCall', on: true },
  ]);
});

test('only people at the table may change the settings', () => {
  const table = createTestTable(1);

  expect(() => table.game.updateSettings('stranger', { turnSeconds: 40 })).toThrow(new TableRoomError('NOT_A_MEMBER'));
});
