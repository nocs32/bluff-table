import type { Mood, TableFaceEvent, TableLookEvent } from '@bluff-table/protocol';
import { makeAutoObservable, observable } from 'mobx';
import { Spring } from '../../utils/spring';
import type { TableSend } from './types';

export interface RoomHeadsDeps {
  send: TableSend;
  now: () => number;
}

// A head's direction (spec §7.1): `x` round the table from its own seat (0 across), `y` up or down.
export interface Look {
  x: number;
  y: number;
}

// One head on springs: it heads for where it was last told to look and never jumps.
export interface HeadSprings {
  x: Spring;
  y: Spring;
}

// rest: looking at the table · pointer: following your pointer · grab: dragged in the mirror ·
// keys: nudged with the arrow keys.
export type RoomHeadsInput = 'rest' | 'pointer' | 'grab' | 'keys';

// Where your head settles when you're not pointing anywhere: down at the table.
export const restLook: Look = { x: 0, y: -0.35 };

// The springs, as in the sketches: snappy while following, wobbly after letting go of the mirror.
const springs = { follow: [140, 16], grab: [220, 18], wobble: [90, 6] } as const;
const wobbleMs = 1300;

// Up to 15 looks a second go out, only when the head moved (spec §7.1).
const sendEveryMs = 1000 / 15;
const sendStep = 0.01;

const newHead = (look: Look): HeadSprings => ({ x: new Spring(look.x, ...springs.follow), y: new Spring(look.y, ...springs.follow) });

const setSprings = (head: HeadSprings, [stiffness, damping]: readonly [number, number]): void => {
  [head.x, head.y].forEach((spring) => {
    spring.stiffness = stiffness;
    spring.damping = damping;
  });
};

const aim = (head: HeadSprings, look: Look): void => {
  head.x.target = Math.max(-1, Math.min(1, look.x));
  head.y.target = Math.max(-1, Math.min(1, look.y));
};

// Everyone's head (spec §7.1) and face (§7.2). Your own follows your pointer, your drag in the
// mirror or the arrow keys, and goes out to the table; everyone else's comes in and is smoothed on
// springs, so a late or missing update never makes a head jump. The springs are read every frame
// by the stage and the mirror, outside React (spec §8.5).
export class RoomHeadsStore {
  input: RoomHeadsInput = 'rest';
  readonly moods = observable.map<string, Mood>();
  readonly mine: HeadSprings = newHead(restLook);
  readonly #others = new Map<string, HeadSprings>();
  readonly #deps: RoomHeadsDeps;
  #sent = { ...restLook, at: 0 };
  #wobbleUntil = 0;

  constructor(deps: RoomHeadsDeps) {
    this.#deps = deps;
    makeAutoObservable<this, '#others' | '#deps' | '#sent' | '#wobbleUntil'>(this, { mine: false, '#others': false, '#deps': false, '#sent': false, '#wobbleUntil': false }, { autoBind: true });
  }

  get isGrabbed(): boolean {
    return this.input === 'grab';
  }

  // Someone else's head, made on first sight looking across the table.
  head(memberId: string): HeadSprings {
    const known = this.#others.get(memberId);

    if (known) return known;

    const head = newHead(restLook);

    this.#others.set(memberId, head);

    return head;
  }

  moodOf(memberId: string): Mood {
    return this.moods.get(memberId) ?? 'idle';
  }

  // The pointer is over the scene, looking at `look`. Ignored while your head is held.
  point(look: Look): void {
    if (this.input === 'grab' || this.input === 'keys') return;

    this.input = 'pointer';
    aim(this.mine, look);
  }

  // The pointer left the scene: back to looking at the table.
  rest(): void {
    if (this.input !== 'pointer') return;

    this.input = 'rest';
    aim(this.mine, restLook);
  }

  grab(): void {
    this.input = 'grab';
    setSprings(this.mine, springs.grab);
  }

  // Dragging your head in the mirror (spec §7.1).
  drag(look: Look): void {
    if (this.input === 'grab') aim(this.mine, look);
  }

  // Let go: it springs back with a wobble.
  release(): void {
    if (this.input !== 'grab') return;

    this.input = 'rest';
    setSprings(this.mine, springs.wobble);
    this.#wobbleUntil = this.#deps.now() + wobbleMs;
    aim(this.mine, restLook);
  }

  nudge(look: Look): void {
    if (this.input === 'grab') return;

    this.input = 'keys';
    aim(this.mine, look);
  }

  unnudge(): void {
    if (this.input !== 'keys') return;

    this.input = 'rest';
    aim(this.mine, restLook);
  }

  receiveLook({ memberId, x, y }: TableLookEvent): void {
    aim(this.head(memberId), { x, y });
  }

  receiveFace({ memberId, mood }: TableFaceEvent): void {
    this.moods.set(memberId, mood);
  }

  // Someone left: their head goes with them.
  forget(memberIds: readonly string[]): void {
    [...this.#others.keys()].filter((id) => !memberIds.includes(id)).forEach((id) => this.#others.delete(id));
  }

  // Every frame: the springs move on, and your look goes out when it's time.
  step(dt: number): void {
    if (this.#wobbleUntil > 0 && this.#deps.now() > this.#wobbleUntil) {
      this.#wobbleUntil = 0;
      setSprings(this.mine, springs.follow);
    }

    [this.mine, ...this.#others.values()].forEach((head) => {
      head.x.step(dt);
      head.y.step(dt);
    });

    this.#share();
  }

  #share(): void {
    const now = this.#deps.now();
    const x = Math.round(this.mine.x.value * 1000) / 1000;
    const y = Math.round(this.mine.y.value * 1000) / 1000;
    const moved = Math.abs(x - this.#sent.x) > sendStep || Math.abs(y - this.#sent.y) > sendStep;

    if (!moved || now - this.#sent.at < sendEveryMs) return;

    this.#sent = { x, y, at: now };
    this.#deps.send('look', { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  }
}
