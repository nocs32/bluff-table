import { defaultGameSettings, noSecrets } from '@bluff-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomError } from '../error.js';
import { createTestTable, type TestTable } from '../test-table.js';
import { tableView } from '../view.js';

const systemLines = ({ feed }: TestTable): unknown[] => feed.items.map((item) => (item.kind === 'system' ? item.event : null));

const handOf = (table: TestTable, seat: string): string[] => (table.game.secret(seat).hand ?? []).map((card) => card.id);

// The player whose turn it is, and the one after them.
const turnOf = (table: TestTable): string => table.game.match.actor ?? '';

const otherThan = (table: TestTable, seat: string): string => table.game.seats.ids.find((id) => id !== seat) ?? '';

// Nobody moves: the clock plays for everyone until the game ends.
const runOut = (table: TestTable): void => {
  for (let step = 0; step < 4000 && table.game.phase === 'round'; step++) table.timers.advance(1000);
};

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

test('dealing needs two seats; anyone deals, and the settings are locked until the lobby', () => {
  expect(() => createTestTable(1).game.start('p0')).toThrow(new TableRoomError('NOT_ENOUGH_PLAYERS'));

  const table = createTestTable(3);

  table.game.start('p2');

  expect(table.game.phase).toBe('round');
  expect(table.game.seats.ids).toEqual(['p0', 'p1', 'p2']);
  expect(['p0', 'p1', 'p2'].map((seat) => handOf(table, seat).length)).toEqual([5, 5, 5]);
  expect(systemLines(table)).toEqual([{ type: 'gameStarted' }]);
  expect(table.game.snapshot()?.round?.step).toBe('turn');
  expect(() => table.game.start('p0')).toThrow(new TableRoomError('WRONG_PHASE'));
  expect(() => table.game.updateSettings('p0', { turnSeconds: 40 })).toThrow(new TableRoomError('WRONG_PHASE'));
});

test('only the player whose turn it is moves, with their own cards; everyone hears a count', () => {
  const table = createTestTable(3);

  table.game.start('p0');
  table.game.drainPlayed();

  const seat = turnOf(table);
  const other = otherThan(table, seat);

  expect(() => table.game.move(other, { type: 'play', cardIds: handOf(table, other).slice(0, 1) })).toThrow(new TableRoomError('NOT_YOUR_TURN'));
  expect(() => table.game.move(seat, { type: 'play', cardIds: handOf(table, other).slice(0, 1) })).toThrow(new TableRoomError('NOT_IN_HAND'));
  expect(() => table.game.move(seat, { type: 'call', double: false })).toThrow(new TableRoomError('NOTHING_TO_CALL'));

  table.game.move(seat, { type: 'play', cardIds: handOf(table, seat).slice(0, 2) });

  expect(table.game.drainPlayed()).toEqual([{ type: 'played', seat, count: 2 }]);
  expect(handOf(table, seat)).toHaveLength(3);
  expect(turnOf(table)).not.toBe(seat);
});

test('someone who joined mid-game watches: no moves, no secrets', () => {
  const table = createTestTable(2);

  table.game.start('p0');
  table.members.join('late', 'Late');

  expect(() => table.game.move('late', { type: 'call', double: false })).toThrow(new TableRoomError('NOT_PLAYING'));
  expect(() => table.game.pull('late')).toThrow(new TableRoomError('NOT_PLAYING'));
  expect(table.game.secret('late')).toEqual(noSecrets);
  expect(table.game.secret('p0').hand).toHaveLength(5);
});

test('nobody moves: the clock plays for everyone, bots stand in after two timeouts, and the game ends', () => {
  const table = createTestTable(3);

  table.game.start('p0');
  runOut(table);

  const winner = table.game.snapshot()?.summary?.winner ?? '';

  expect(table.game.phase).toBe('over');
  expect(table.game.snapshot()?.seats.filter((seat) => seat.alive).map((seat) => seat.id)).toEqual([winner]);
  expect(table.game.seats.standIns.size).toBeGreaterThan(0);
  expect(table.members.get(winner).wins).toBe(1);
  expect(systemLines(table).filter((line) => (line as { type: string }).type === 'died')).toHaveLength(2);
  expect(systemLines(table).at(-1)).toEqual({ type: 'gameWon', bounty: 100 });
  expect(table.game.secret('p0').ghost?.hands).toBeDefined();
});

test('after a game: Play again deals the next one, or everyone goes back to the lobby', () => {
  const table = createTestTable(2);

  table.game.start('p0');
  expect(() => table.game.toLobby('p0')).toThrow(new TableRoomError('WRONG_PHASE'));
  runOut(table);

  table.game.playAgain('p1');
  expect(table.game.phase).toBe('round');
  expect(table.game.seats.standIns.size).toBe(0);
  expect(table.game.snapshot()?.seats.every((seat) => seat.alive && seat.used === 0)).toBe(true);

  runOut(table);
  table.game.toLobby('p0');
  expect(table.game.phase).toBe('lobby');
  expect(table.game.snapshot()).toBeNull();
  expect(table.game.secret('p0')).toEqual(noSecrets);
});

test('someone who leaves mid-game keeps their seat, played by a bot, under their own name', () => {
  const table = createTestTable(3);

  table.game.start('p0');
  table.members.leave('p1');
  table.game.leave('p1');

  const seat = table.game.snapshot()?.seats.find((one) => one.id === 'p1');

  expect(seat).toMatchObject({ name: 'Player 1', standIn: true, alive: true, cards: 5 });
});

test('a person who moves takes their seat back from the bot', () => {
  const table = createTestTable(2);

  table.game.start('p0');

  const seat = turnOf(table);

  table.game.seats.timedOut(seat);
  table.game.seats.timedOut(seat);
  expect(table.game.seats.standIns.has(seat)).toBe(true);

  table.game.move(seat, { type: 'play', cardIds: handOf(table, seat).slice(0, 1) });
  expect(table.game.seats.standIns.has(seat)).toBe(false);
});
