import { createRandom } from '@bluff-table/engine';
import { expect, test } from 'vitest';
import { createTestTimers, type TestTimers } from '../test-table.js';
import { TableRoomHeads } from './index.js';

interface Sent {
  to: string;
  type: string;
  message: unknown;
}

interface Harness {
  heads: TableRoomHeads;
  sent: Sent[];
  timers: TestTimers;
  order: string[];
}

const createHeads = (order = ['ana', 'bo', 'cy']): Harness => {
  const sent: Sent[] = [];
  const timers = createTestTimers();

  const heads = new TableRoomHeads({
    schedule: timers.schedule,
    now: timers.now,
    random: createRandom(3),
    order: () => order,
    relayMs: 100,
    send: (to, type, message) => sent.push({ to, type, message }),
    broadcast: (type, message, exceptId) => sent.push({ to: `all but ${exceptId}`, type, message }),
  });

  return { heads, sent, timers, order };
};

test('a look goes on to everyone else straight away', () => {
  const { heads, sent } = createHeads();

  heads.look('ana', 0.2, -0.1);

  expect(sent).toEqual([{ to: 'all but ana', type: 'look', message: { memberId: 'ana', x: 0.2, y: -0.1 } }]);
});

test('looks that come too fast wait, and only the latest goes on', () => {
  const { heads, sent, timers } = createHeads();

  heads.look('ana', 0.1, 0);
  timers.advance(20);
  heads.look('ana', 0.2, 0);
  heads.look('ana', 0.3, 0);
  heads.look('bo', -0.5, 0);

  expect(sent.map(({ message }) => message)).toEqual([
    { memberId: 'ana', x: 0.1, y: 0 },
    { memberId: 'bo', x: -0.5, y: 0 },
  ]);

  timers.advance(80);
  expect(sent.at(-1)?.message).toEqual({ memberId: 'ana', x: 0.3, y: 0 });
  expect(sent).toHaveLength(3);
});

test('someone who joins or reconnects is sent where every other head points', () => {
  const { heads, sent } = createHeads();

  heads.look('ana', 0.1, 0);
  heads.look('bo', 0.4, 0.2);
  sent.length = 0;
  heads.sync('bo');

  expect(sent).toEqual([{ to: 'bo', type: 'look', message: { memberId: 'ana', x: 0.1, y: 0 } }]);
});

test('a face goes to everyone else; someone who left is forgotten', () => {
  const { heads, sent } = createHeads();

  heads.face('cy', 'smirk');
  heads.look('cy', 0.1, 0);
  heads.forget('cy');
  sent.length = 0;
  heads.sync('ana');

  expect(sent).toEqual([]);
});

test('bots look about by themselves', () => {
  const { heads, sent, timers } = createHeads(['ana', 'bot']);

  heads.bots.seat(['bot']);
  timers.advance(5000);

  expect(sent.filter(({ type, message }) => type === 'look' && (message as { memberId: string }).memberId === 'bot').length).toBeGreaterThan(1);
});

test('stare at a bot for about a second and it stares back, suspicious', () => {
  const { heads, sent, timers } = createHeads(['ana', 'bot']);

  heads.bots.seat(['bot']);
  // From ana's seat the only other place is straight across.
  heads.look('ana', 0, 0);
  timers.advance(1000);

  expect(sent).toContainEqual({ to: 'all but bot', type: 'face', message: { memberId: 'bot', mood: 'suspicious' } });
  expect(sent).toContainEqual({ to: 'all but bot', type: 'look', message: { memberId: 'bot', x: 0, y: 0.05 } });
});

test('a glance away in time sets off nothing', () => {
  const { heads, sent, timers } = createHeads(['ana', 'bot']);

  heads.bots.seat(['bot']);
  heads.look('ana', 0, 0);
  timers.advance(500);
  heads.look('ana', 0, -0.9);
  timers.advance(2000);

  expect(sent.some(({ type }) => type === 'face')).toBe(false);
});
