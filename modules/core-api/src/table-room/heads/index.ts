import type { Mood, TableEvents, TableLookEvent } from '@bluff-table/protocol';
import type { Schedule } from '../lifecycle.js';
import { TableRoomHeadsBots } from './bots.js';

export interface TableRoomHeadsDeps {
  schedule: Schedule;
  now: () => number;
  random: () => number;
  // Everyone round the table, in order: the game's seats, or everyone here in the lobby.
  order: () => readonly string[];
  // The least time between two looks of one person going out.
  relayMs: number;
  send: <K extends keyof TableEvents>(memberId: string, type: K, message: TableEvents[K]) => void;
  // To everyone but `exceptId` (whose own head it is).
  broadcast: <K extends keyof TableEvents>(type: K, message: TableEvents[K], exceptId: string) => void;
}

// One person's head, as relayed: where it last pointed, when that went out, and a look held back
// until it may go.
interface TableRoomHead {
  look: TableLookEvent;
  sentAt: number;
  cancel: (() => void) | null;
}

// Everyone's head (spec §7.1, D8): looks come in up to 20 a second and go on to everyone else at
// most 15 a second per person; a look that comes too soon waits, and only the latest one goes, so
// the last place a head stopped always arrives. Browsers smooth what they get on springs. Faces
// pass straight on. Someone who joins or reconnects is sent where every head points now. The bots'
// heads are driven from here too.
export class TableRoomHeads {
  readonly bots: TableRoomHeadsBots;
  readonly #heads = new Map<string, TableRoomHead>();
  readonly #deps: TableRoomHeadsDeps;

  constructor(deps: TableRoomHeadsDeps) {
    this.#deps = deps;

    this.bots = new TableRoomHeadsBots({
      schedule: deps.schedule,
      random: deps.random,
      order: deps.order,
      look: (memberId, x, y) => this.#turn(memberId, x, y),
      face: (memberId, mood) => this.face(memberId, mood),
    });
  }

  // A person's head: bots they stare at stare back.
  look(memberId: string, x: number, y: number): void {
    this.#turn(memberId, x, y);
    this.bots.watch(memberId, x, y);
  }

  face(memberId: string, mood: Mood): void {
    this.#deps.broadcast('face', { memberId, mood }, memberId);
  }

  // Where everyone else's head points now, for a browser that just joined or reconnected.
  sync(memberId: string): void {
    this.#heads.forEach((head, id) => {
      if (id !== memberId) this.#deps.send(memberId, 'look', head.look);
    });
  }

  forget(memberId: string): void {
    this.#heads.get(memberId)?.cancel?.();
    this.#heads.delete(memberId);
    this.bots.forget(memberId);
  }

  dispose(): void {
    [...this.#heads.keys()].forEach((id) => this.forget(id));
    this.bots.dispose();
  }

  // A head turns: the look goes out now, or as soon as it may.
  #turn(memberId: string, x: number, y: number): void {
    const head = this.#heads.get(memberId) ?? { look: { memberId, x, y }, sentAt: -Infinity, cancel: null };
    const wait = head.sentAt + this.#deps.relayMs - this.#deps.now();

    head.look = { memberId, x, y };
    this.#heads.set(memberId, head);

    if (head.cancel) return;

    if (wait <= 0) this.#relay(head);
    else head.cancel = this.#deps.schedule(() => this.#relay(head), wait);
  }

  #relay(head: TableRoomHead): void {
    head.cancel = null;
    head.sentAt = this.#deps.now();
    this.#deps.broadcast('look', head.look, head.look.memberId);
  }
}
