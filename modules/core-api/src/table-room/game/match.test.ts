import { gamePace, revealMs } from '@bluff-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomError } from '../error.js';
import { createTestTable, type TestTable } from '../test-table.js';

const handOf = (table: TestTable, seat: string): string[] => (table.game.secret(seat).hand ?? []).map((card) => card.id);

const types = (table: TestTable): string[] => table.game.drainPlayed().map((event) => event.type);

// A play of two cards, then Liar! on it from the next player.
const playAndCall = (table: TestTable): { player: string; caller: string } => {
  const player = table.game.match.actor ?? '';

  table.game.move(player, { type: 'play', cardIds: handOf(table, player).slice(0, 2) });

  const caller = table.game.match.actor ?? '';

  table.game.move(caller, { type: 'call', double: false });

  return { player, caller };
};

test('the turn has the turn’s time; out of time, the table plays a card for you', () => {
  const table = createTestTable(3);

  table.game.updateSettings('p0', { turnSeconds: 20 });
  table.game.start('p0');
  table.game.drainPlayed();

  const seat = table.game.match.actor ?? '';

  expect(table.game.match.endsAt).toBe(20_000);
  table.timers.advance(19_999);
  expect(table.game.match.actor).toBe(seat);

  table.timers.advance(1);

  expect(table.game.drainPlayed()).toEqual([
    { type: 'timedOut', seat, step: 'turn' },
    { type: 'played', seat, count: 1 },
  ]);

  expect(handOf(table, seat)).toHaveLength(4);
});

test('after Liar!: the cards flip, then the gun is out for 10 seconds, then the beat, then the click or the bang', () => {
  const table = createTestTable(3);

  table.game.start('p0');
  table.game.drainPlayed();

  const pulls = playAndCall(table);

  expect(types(table)).toEqual(['played', 'called', 'revealed', 'mustPull']);
  expect(table.game.match.step).toBe('reveal');
  expect(table.game.match.actor).toBeNull();

  table.timers.advance(revealMs(2));

  const puller = table.game.snapshot()?.round?.puller?.seat ?? '';

  expect([pulls.player, pulls.caller]).toContain(puller);
  expect(table.game.match.step).toBe('pull');
  expect(table.game.match.endsAt).toBe(table.timers.now() + gamePace.pullMs);
  expect(() => table.game.pull(puller === pulls.player ? pulls.caller : pulls.player)).toThrow(new TableRoomError('NOT_YOUR_TURN'));

  table.game.pull(puller);
  expect(table.game.match.step).toBe('pulling');
  expect(types(table)).toEqual(['pulling']);
  expect(() => table.game.pull(puller)).toThrow(new TableRoomError('WRONG_PHASE'));

  table.timers.advance(gamePace.beatMs.max);
  expect(types(table)).toEqual(['pulled', 'roundOver']);
  expect(table.game.match.step).toBe('roundOver');

  table.timers.advance(gamePace.afterBangMs);
  expect(table.game.snapshot()?.round).toMatchObject({ number: 2, step: 'turn' });
  expect(types(table)).toEqual(['dealt']);
});

test('nobody may play while the cards flip or the gun is out', () => {
  const table = createTestTable(3);

  table.game.start('p0');
  playAndCall(table);

  const anyone = table.game.seats.ids[0] ?? '';

  expect(() => table.game.move(anyone, { type: 'call', double: false })).toThrow(new TableRoomError('WRONG_PHASE'));
  expect(() => table.game.pull(anyone)).toThrow(new TableRoomError('WRONG_PHASE'));
});

test('the gun pulls by itself after 10 seconds, and that counts as a timeout', () => {
  const table = createTestTable(3);

  table.game.start('p0');
  playAndCall(table);
  table.timers.advance(revealMs(2));
  table.game.drainPlayed();

  const puller = table.game.match.actor ?? '';

  table.timers.advance(gamePace.pullMs);

  expect(table.game.drainPlayed()).toEqual([
    { type: 'timedOut', seat: puller, step: 'pull' },
    { type: 'pulling', seat: puller },
  ]);
});
