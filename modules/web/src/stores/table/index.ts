import type { GameSwitch, PlayEvent } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { SoundsService } from '../../services';
import type { Translate } from '../locale';

export interface TableDeps {
  t: Translate;
  now: () => number;
  sounds: SoundsService;
}

// When the lamp was last poked, and how many times.
export interface TablePoke {
  at: number;
  count: number;
}

export interface TableInsets {
  left: number;
  right: number;
  bottom: number;
}

// A bang (spec §8.4): who, and which one, so the flash plays once for each.
export interface TableBang {
  seat: string;
  count: number;
}

// What the pointer is over on the stage: the hanging lamp (poke it and it swings), a free chair
// (click it to sit a bot there), or something with a tooltip saying what it is (spec D22): a
// switch's tent card, someone's revolver or name tag, the table card, the pile, a whisper mark.
export type TableHover = { kind: 'lamp' } | { kind: 'chair' } | { kind: 'tent'; name: GameSwitch; hint: string } | { kind: 'revolver'; id: string; hint: string } | { kind: 'info'; id: string; hint: string };

const sameTarget = (one: TableHover, other: TableHover): boolean => {
  if (one.kind === 'tent' && other.kind === 'tent') return one.name === other.name;

  if ((one.kind === 'revolver' && other.kind === 'revolver') || (one.kind === 'info' && other.kind === 'info')) return one.id === other.id;

  return one.kind === other.kind;
};

// The scripted moments (spec §8.4), read and written every frame outside React: how far the room
// has dimmed for a pull, how far the camera has pushed in and towards where, and after a bang the
// lights going out for a moment (`blackout`, from 1 down) and the camera's jolt. And whose turn it
// is: how far the spotlight on them is up (`spot`, 0 to 1).
export interface TableDrama {
  dim: number;
  spot: number;
  push: number;
  focus: { x: number; z: number };
  blackout: number;
  jolt: number;
}

// What happens on the 3D table itself, in this browser: what the pointer is over (for the cursor
// and a tooltip, spec D22), the lamp's swing, the pull's drama, and how far the lobby's or the
// round's cards cover the table, so the camera frames what's left.
export class TableStore {
  hovered: TableHover | null = null;
  // Pixels of the stage covered by the HTML: its cards on the left and on the right, and along
  // the bottom.
  insets: TableInsets = { left: 0, right: 0, bottom: 0 };
  lampPoke: TablePoke = { at: 0, count: 0 };
  bang: TableBang | null = null;
  // The typefaces have loaded: lettering drawn into the scene (posters, name tags) is drawn again.
  fontsReady = false;
  // How far the hanging lamp swings (radians), written every frame by the lamp: its light follows.
  readonly sway = { lamp: 0 };
  readonly drama: TableDrama = { dim: 0, spot: 0, push: 0, focus: { x: 0, z: 0 }, blackout: 0, jolt: 0 };
  readonly #t: Translate;
  readonly #now: () => number;
  readonly #sounds: SoundsService;

  constructor(deps: TableDeps) {
    this.#t = deps.t;
    this.#now = deps.now;
    this.#sounds = deps.sounds;
    makeAutoObservable(this, { sway: false, drama: false }, { autoBind: true });
  }

  get cursor(): string {
    return this.hovered?.kind === 'lamp' || this.hovered?.kind === 'chair' || this.hovered?.kind === 'tent' ? 'pointer' : 'auto';
  }

  // The canvas's tooltip: what the thing under the pointer is, or what a click on it does.
  get hint(): string {
    const hovered = this.hovered;

    if (!hovered) return '';

    if (hovered.kind === 'lamp') return this.#t('table.lampHint');

    return hovered.kind === 'chair' ? this.#t('table.chairHint') : hovered.hint;
  }

  isRevolverHovered(id: string): boolean {
    return this.hovered?.kind === 'revolver' && this.hovered.id === id;
  }

  get isLampHovered(): boolean {
    return this.hovered?.kind === 'lamp';
  }

  hover(target: TableHover | null): void {
    this.hovered = target;
  }

  // Leaving one thing: only clears the hover if it's still that thing (the pointer may already be
  // over the next one).
  leave(left: TableHover): void {
    if (this.hovered && sameTarget(this.hovered, left)) this.hover(null);
  }

  pokeLamp(): void {
    this.lampPoke = { at: this.#now(), count: this.lampPoke.count + 1 };
    this.#sounds.play('creak');
  }

  // What just happened at the table: a bang puts the lights out for a moment and jolts the camera;
  // a Liar! sets the lamp swinging (spec §8.2).
  receivePlay(events: readonly PlayEvent[]): void {
    events.forEach((event) => {
      if (event.type === 'called') this.lampPoke = { at: this.#now(), count: this.lampPoke.count + 1 };

      if (event.type === 'pulled' && event.bang) {
        this.bang = { seat: event.seat, count: (this.bang?.count ?? 0) + 1 };
        this.drama.blackout = 1;
        this.drama.jolt = 1;
      }
    });
  }

  markFontsReady(): void {
    this.fontsReady = true;
  }

  setInsets({ left, right, bottom }: TableInsets): void {
    this.insets = { left: Math.max(0, Math.round(left)), right: Math.max(0, Math.round(right)), bottom: Math.max(0, Math.round(bottom)) };
  }
}
