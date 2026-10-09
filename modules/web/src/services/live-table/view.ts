import { feedMaxItems, noSecrets, type FeedItem, type GameSnapshot, type MemberSnapshot, type SecretSnapshot, type TableFeedEvent, type TableSnapshot, type TableViewEvent } from '@bluff-table/protocol';

// Clock samples kept: the best of the recent ones wins.
const maxSamples = 10;

// Puts the server's view (with your secrets) and feed back together into the snapshots the stores read, the same
// shape the demo table sends. Server times become this browser's times: each view carries the
// server's clock, and the gap to ours, minus the trip, is the offset. A slow trip only makes a
// sample smaller, so the largest recent one is the closest.
export class LiveTableView {
  #members: MemberSnapshot[] = [];
  #game: GameSnapshot | null = null;
  #feed: FeedItem[] = [];
  #secret: SecretSnapshot = noSecrets;
  #samples: number[] = [];
  readonly #now: () => number;
  readonly #emit: (snapshot: TableSnapshot) => void;

  constructor(now: () => number, emit: (snapshot: TableSnapshot) => void) {
    this.#now = now;
    this.#emit = emit;
  }

  // The table as you see it, your secrets with it.
  view({ now, members, game, secret }: TableViewEvent): void {
    this.#samples = [...this.#samples, now - this.#now()].slice(-maxSamples);
    this.#members = members;
    this.#game = game;
    this.#secret = secret;
    this.#send();
  }

  feed({ reset, items }: TableFeedEvent): void {
    this.#feed = (reset ? items : [...this.#feed, ...items]).slice(-feedMaxItems);
    this.#send();
  }

  // How far the server's clock is ahead of ours.
  get #offset(): number {
    return this.#samples.length > 0 ? Math.max(...this.#samples) : 0;
  }

  #send(): void {
    const game = this.#game;
    const local = (at: number): number => at - this.#offset;

    if (!game) return;

    const round = game.match?.round;

    this.#emit({
      members: this.#members,
      game: game.match && round ? { ...game, match: { ...game.match, round: { ...round, endsAt: local(round.endsAt) } } } : game,
      feed: this.#feed.map((item) => ({ ...item, at: local(item.at) })),
      secret: this.#secret,
    });
  }
}
