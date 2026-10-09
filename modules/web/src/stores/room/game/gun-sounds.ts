import type { PlayEvent } from '@bluff-table/protocol';
import { reaction } from 'mobx';
import type { SoundsService } from '../../../services';
import type { RoomGameMatchStore } from './match';
import type { RoomGamePullStore } from './pull';

export interface RoomGameGunSoundsStoreDeps {
  sounds: SoundsService;
  match: RoomGameMatchStore;
  pull: RoomGamePullStore;
  // A game is being played, and the table is connected.
  isOn: () => boolean;
}

// The heartbeat is louder when it's your own gun (spec §8.4).
const heartbeatLevels = { mine: 1, theirs: 0.5 } as const;

// The gun's sounds (spec §7.4, §8.4): the cylinder turning as someone picks up their gun, a
// heartbeat while it's at their head, the hammer cocking when they press, then the dry click or
// the bang.
export class RoomGameGunSoundsStore {
  #stopHeartbeat: (() => void) | null = null;
  readonly #deps: RoomGameGunSoundsStoreDeps;

  constructor(deps: RoomGameGunSoundsStoreDeps) {
    this.#deps = deps;
    this.#listen();
  }

  // What just happened: the press, and what the chamber held.
  receive(events: readonly PlayEvent[]): void {
    const { sounds } = this.#deps;

    events.forEach((event) => {
      if (event.type === 'pulling') sounds.play('cock');

      if (event.type === 'pulled') sounds.play(event.bang ? 'bang' : 'click');
    });
  }

  // Which gun is out now, a pull at a time (a double call gets two), or null.
  get #gunOut(): string | null {
    const { match, pull } = this.#deps;
    const puller = match.round?.puller;

    if (!this.#deps.isOn() || pull.step !== 'pull' || !puller) return null;

    return `${match.round?.number ?? 0}|${puller.seat}|${match.seat(puller.seat)?.used ?? 0}`;
  }

  // Whose heartbeat is playing: none, yours, or someone else's.
  get #heartbeat(): keyof typeof heartbeatLevels | null {
    const { pull } = this.#deps;

    if (!this.#deps.isOn() || (pull.step !== 'pull' && pull.step !== 'pulling')) return null;

    return pull.isMine ? 'mine' : 'theirs';
  }

  #listen(): void {
    const { sounds } = this.#deps;

    reaction(
      () => this.#gunOut,
      (gun) => gun && sounds.play('cylinder'),
    );

    reaction(
      () => this.#heartbeat,
      (whose) => {
        this.#stopHeartbeat?.();
        this.#stopHeartbeat = whose ? sounds.loop('heartbeat', { level: heartbeatLevels[whose] }) : null;
      },
    );
  }
}
