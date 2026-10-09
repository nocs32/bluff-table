import { defaultGameSettings, noSecrets, type PlayEvent, type SecretSnapshot, type TableEvents } from '@bluff-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomFeed } from './feed.js';
import { TableRoomOutbox } from './outbox.js';
import type { TableRoomView } from './view.js';

interface Sent {
  to: string;
  type: keyof TableEvents;
  message: unknown;
}

interface Harness {
  outbox: TableRoomOutbox;
  feed: TableRoomFeed;
  sent: Sent[];
  state: { turnSeconds: number; played: PlayEvent[]; secrets: Record<string, SecretSnapshot> };
}

const ana = { id: 'a', name: 'Ana', color: 'blue' } as const;

const createOutbox = (): Harness => {
  const sent: Sent[] = [];
  const state: Harness['state'] = { turnSeconds: 20, played: [], secrets: {} };
  let lines = 0;
  const feed = new TableRoomFeed({ now: () => 0, createId: () => `line-${++lines}`, maxItems: 50 });

  const outbox = new TableRoomOutbox({
    feed,
    view: () => ({ members: [], game: { phase: 'lobby', settings: { ...defaultGameSettings, turnSeconds: state.turnSeconds }, match: null } }) satisfies TableRoomView,
    secret: (memberId) => state.secrets[memberId] ?? noSecrets,
    drainPlayed: () => state.played.splice(0),
    now: () => 0,
    send: (to, type, message) => sent.push({ to, type, message }),
  });

  return { outbox, feed, sent, state };
};

const kinds = (sent: readonly Sent[]): Array<{ to: string; type: string }> => sent.map(({ to, type }) => ({ to, type }));

test('sync sends one browser everything it may see', () => {
  const { outbox, sent } = createOutbox();

  outbox.sync('a');

  expect(kinds(sent)).toEqual([
    { to: 'a', type: 'view' },
    { to: 'a', type: 'feed' },
  ]);
});

test('nothing goes to a browser before it syncs; then its view only when it changed, and new feed lines', () => {
  const { outbox, feed, sent, state } = createOutbox();

  outbox.flush();
  expect(sent).toEqual([]);

  outbox.sync('a');
  outbox.flush();
  sent.length = 0;
  feed.message(ana, 'hello');
  state.turnSeconds = 30;
  outbox.flush();

  expect(kinds(sent)).toEqual([
    { to: 'a', type: 'view' },
    { to: 'a', type: 'feed' },
  ]);
});

test('each view carries only its own browser’s secrets, and what happened follows the view', () => {
  const { outbox, sent, state } = createOutbox();
  const hand = [{ id: 'k1', rank: 'king' }] as const;

  outbox.sync('a');
  outbox.sync('b');
  sent.length = 0;
  state.secrets = { a: { hand: [...hand], ghost: null, crooked: null } };
  state.played = [{ type: 'played', seat: 'a', count: 1 }];
  outbox.flush();

  expect(kinds(sent)).toEqual([
    { to: 'a', type: 'view' },
    { to: 'a', type: 'play' },
    { to: 'b', type: 'play' },
  ]);

  expect((sent[0]?.message as TableEvents['view']).secret.hand).toEqual(hand);
});

test('nothing personal goes out after forget', () => {
  const { outbox, feed, sent } = createOutbox();

  outbox.sync('a');
  outbox.flush();
  outbox.forget('a');
  sent.length = 0;
  feed.message(ana, 'anyone there?');
  outbox.flush();

  expect(sent).toEqual([]);
});
