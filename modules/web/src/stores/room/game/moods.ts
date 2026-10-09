import { wheelMoods, type Mood, type PlayEvent, type TableFaceEvent, type WheelMood } from '@bluff-table/protocol';
import { makeAutoObservable, observable } from 'mobx';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';
import type { RoomGameMatchStore } from './match';

export interface RoomGameMoodsDeps {
  t: Translate;
  send: TableSend;
  match: RoomGameMatchStore;
  now: () => number;
}

// One face on the wheel, and its name.
export interface WheelFace {
  mood: WheelMood;
  label: string;
}

// A face held until a moment (ms on this browser's clock).
interface HeldFace {
  mood: Mood;
  until: number;
}

// The face wheel's faces last this long (spec §7.2), and the relief after a click a little less.
const wheelMs = 3000;
const phewMs = 2600;

// Everyone's face (spec §7.2): what the game puts on it by itself (a poker face, sweating when
// called, eyes shut for the pull, relief after a click, X eyes after a bang), and the face wheel's
// faces, held for three seconds. Read every frame by the stage and the mirror.
export class RoomGameMoodsStore {
  readonly #held = observable.map<string, HeldFace>();
  // The face wheel round your mirror: closed ⇄ open.
  wheelOpen = false;
  // Who called the play being flipped (they look on suspiciously), and whose it is (they sweat).
  caller: string | null = null;
  flipped: string | null = null;
  readonly #deps: RoomGameMoodsDeps;

  constructor(deps: RoomGameMoodsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // The face `id` pulls now. Ghosts keep their faces (spec §5.7): `ghost` asks for the ghost's.
  moodOf(id: string, ghost = false): Mood {
    const held = this.#held.get(id);
    const now = this.#deps.now();

    if (held && held.until > now && (ghost || held.mood !== 'phew' || !this.#isDead(id))) return held.mood;

    if (!ghost && this.#isDead(id)) return 'dead';

    return ghost ? 'idle' : this.#gameMood(id);
  }

  get wheel(): WheelFace[] {
    return wheelMoods.map((mood) => ({ mood, label: this.#deps.t(`round.faces.${mood}`) }));
  }

  toggleWheel(): void {
    this.wheelOpen = !this.wheelOpen;
  }

  closeWheel(): void {
    this.wheelOpen = false;
  }

  // Your face from the wheel: everyone sees it for three seconds.
  pick(mood: WheelMood): void {
    this.#held.set(this.#deps.match.meId, { mood, until: this.#deps.now() + wheelMs });
    this.#deps.send('face', { mood });
    this.wheelOpen = false;
  }

  receiveFace({ memberId, mood }: TableFaceEvent): void {
    this.#held.set(memberId, { mood, until: this.#deps.now() + wheelMs });
  }

  receive(events: readonly PlayEvent[]): void {
    events.forEach((event) => {
      if (event.type === 'called') this.caller = event.seat;

      if (event.type === 'revealed') this.flipped = event.seat;

      if (event.type === 'dealt') this.#forgetRound();

      if (event.type === 'pulled' && !event.bang) this.#held.set(event.seat, { mood: 'phew', until: this.#deps.now() + phewMs });
    });
  }

  clear(): void {
    this.#held.clear();
    this.#forgetRound();
  }

  #forgetRound(): void {
    this.caller = null;
    this.flipped = null;
  }

  #isDead(id: string): boolean {
    const seat = this.#deps.match.seat(id);

    return seat !== null && !seat.alive;
  }

  #gameMood(id: string): Mood {
    const round = this.#deps.match.round;

    if (!round) return 'idle';

    if (round.puller?.seat === id && (round.step === 'pull' || round.step === 'pulling')) return 'pull';

    if (round.step === 'reveal' || round.step === 'pull') return this.#revealMood(id);

    return 'idle';
  }

  // While the called cards flip: the one called sweats, the caller squints.
  #revealMood(id: string): Mood {
    if (this.flipped === id) return 'sweat';

    return this.caller === id ? 'suspicious' : 'idle';
  }
}
