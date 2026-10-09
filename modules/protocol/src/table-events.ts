import type { PlayEvent } from './round.js';
import type { FeedItem, GameSnapshot, MemberSnapshot, SecretSnapshot, TableFaceEvent, TableLookEvent, TableReactionEvent } from './table.js';
import type { TableErrorEvent } from './table-errors.js';

// Server → client events of the live table. The web app's table client turns them back into the
// snapshots the stores read, the same shapes the demo table sends (spec D28).

// The table as one person sees it: the part that's the same for everyone, and what only they may
// see (D24), together, so a new hand never arrives without the round it belongs to. `now` is the
// server's clock, so browsers can turn server times into their own.
export interface TableViewEvent {
  now: number;
  members: MemberSnapshot[];
  game: GameSnapshot;
  secret: SecretSnapshot;
}

// New feed lines, or (`reset`) all of them, after joining or reconnecting.
export interface TableFeedEvent {
  reset: boolean;
  items: FeedItem[];
}

// What just happened at the table, in order, for everyone (spec §10.4).
export interface TablePlayEvent {
  events: PlayEvent[];
}

export interface TableEvents {
  view: TableViewEvent;
  play: TablePlayEvent;
  feed: TableFeedEvent;
  reaction: TableReactionEvent;
  look: TableLookEvent;
  face: TableFaceEvent;
  error: TableErrorEvent;
}
