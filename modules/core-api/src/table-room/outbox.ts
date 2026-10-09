import type { PlayEvent, SecretSnapshot, TableEvents } from '@bluff-table/protocol';
import type { TableRoomFeed } from './feed.js';
import type { TableRoomView } from './view.js';

type TableRoomOutboxSend = <K extends keyof TableEvents>(memberId: string, type: K, message: TableEvents[K]) => void;

export interface TableRoomOutboxDeps {
  feed: TableRoomFeed;
  // The shared part of the table, the same for everyone.
  view: () => TableRoomView;
  // What only this person may see (D24).
  secret: (memberId: string) => SecretSnapshot;
  // What happened at the table since the last flush, as everyone may see it.
  drainPlayed: () => PlayEvent[];
  now: () => number;
  send: TableRoomOutboxSend;
}

// What one browser has been sent so far.
interface TableRoomOutboxSeen {
  feedSeq: number;
  view: string;
}

// What goes out after every change (spec §10.4), to each browser that has asked with `sync` (so
// it's listening by then): its view when it changed (the table, and its own secrets with it, so a
// hand never arrives without the round it belongs to), then what just happened, then the feed lines
// it hasn't had. Nobody is ever sent another living player's cards, the house before the round
// ends unless the barkeep whispered it to them, or where a bullet is (D24).
export class TableRoomOutbox {
  readonly #seen = new Map<string, TableRoomOutboxSeen>();
  readonly #deps: TableRoomOutboxDeps;

  constructor(deps: TableRoomOutboxDeps) {
    this.#deps = deps;
  }

  // Everything again, for a browser that just joined or reconnected: the table and the chat.
  sync(memberId: string): void {
    const { feed, send } = this.#deps;
    const view = this.#viewFor(memberId, this.#deps.view());

    send(memberId, 'view', { now: this.#deps.now(), ...view });
    send(memberId, 'feed', { reset: true, items: feed.items });
    this.#seen.set(memberId, { feedSeq: feed.seq, view: JSON.stringify(view) });
  }

  // Their connection dropped or they left: nothing personal until they sync again.
  forget(memberId: string): void {
    this.#seen.delete(memberId);
  }

  flush(): void {
    const shared = this.#deps.view();
    const played = this.#deps.drainPlayed();

    this.#seen.forEach((seen, memberId) => this.#flushTo(memberId, seen, shared, played));
  }

  dispose(): void {
    this.#seen.clear();
  }

  #viewFor(memberId: string, shared: TableRoomView): TableRoomView & { secret: SecretSnapshot } {
    return { ...shared, secret: this.#deps.secret(memberId) };
  }

  #flushTo(memberId: string, seen: TableRoomOutboxSeen, shared: TableRoomView, played: readonly PlayEvent[]): void {
    const { feed, send } = this.#deps;
    const view = this.#viewFor(memberId, shared);
    const text = JSON.stringify(view);
    const items = feed.since(seen.feedSeq);

    if (text !== seen.view) send(memberId, 'view', { now: this.#deps.now(), ...view });

    if (played.length > 0) send(memberId, 'play', { events: [...played] });

    if (items.length > 0) send(memberId, 'feed', { reset: false, items });

    this.#seen.set(memberId, { feedSeq: feed.seq, view: text });
  }
}
