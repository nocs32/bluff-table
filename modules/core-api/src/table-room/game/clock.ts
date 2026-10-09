import type { Schedule } from '../lifecycle.js';

export interface TableRoomGameClockDeps {
  schedule: Schedule;
  now: () => number;
}

// One deadline at a time: a turn's time, the called cards flipping, the gun's 10 seconds, the beat
// before the click or the bang, the pause after a round. Setting a new one replaces the old.
// States: idle ⇄ running.
export class TableRoomGameClock {
  endsAt: number | null = null;
  #cancel: (() => void) | null = null;
  readonly #deps: TableRoomGameClockDeps;

  constructor(deps: TableRoomGameClockDeps) {
    this.#deps = deps;
  }

  start(delayMs: number, onEnd: () => void): void {
    this.stop();
    this.endsAt = this.#deps.now() + delayMs;

    this.#cancel = this.#deps.schedule(() => {
      this.endsAt = null;
      this.#cancel = null;
      onEnd();
    }, delayMs);
  }

  stop(): void {
    this.#cancel?.();
    this.#cancel = null;
    this.endsAt = null;
  }

  dispose(): void {
    this.stop();
  }
}
