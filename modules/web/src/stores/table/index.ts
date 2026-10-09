import type { GameSwitch } from '@bluff-table/protocol';
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

// What the pointer is over on the stage: the hanging lamp (poke it and it swings), a switch's tent
// card (its tooltip says what the switch does), or a free chair (click it to sit a bot there).
export type TableHover = { kind: 'lamp' } | { kind: 'chair' } | { kind: 'tent'; name: GameSwitch; hint: string };

const sameTarget = (one: TableHover, other: TableHover): boolean => {
  if (one.kind === 'tent' && other.kind === 'tent') return one.name === other.name;

  return one.kind === other.kind;
};

// What happens on the 3D table itself, in this browser: what the pointer is over (for the cursor
// and a tooltip saying what a click does, spec D22), the lamp's swing, and how far the lobby's
// side panels cover the table, so the camera frames what's left.
export class TableStore {
  hovered: TableHover | null = null;
  // Pixels of the stage covered by the lobby: its cards on the left and on the right, and Deal the
  // cards along the bottom.
  insets: TableInsets = { left: 0, right: 0, bottom: 0 };
  lampPoke: TablePoke = { at: 0, count: 0 };
  // The typefaces have loaded: lettering drawn into the scene (posters, name tags) is drawn again.
  fontsReady = false;
  // How far the hanging lamp swings (radians), written every frame by the lamp: its light follows.
  readonly sway = { lamp: 0 };
  readonly #t: Translate;
  readonly #now: () => number;
  readonly #sounds: SoundsService;

  constructor(deps: TableDeps) {
    this.#t = deps.t;
    this.#now = deps.now;
    this.#sounds = deps.sounds;
    makeAutoObservable(this, { sway: false }, { autoBind: true });
  }

  get cursor(): string {
    return this.hovered?.kind === 'lamp' || this.hovered?.kind === 'chair' ? 'pointer' : 'auto';
  }

  // The canvas's tooltip: what the thing under the pointer is, or what a click on it does.
  get hint(): string {
    const hovered = this.hovered;

    if (!hovered) return '';

    if (hovered.kind === 'lamp') return this.#t('table.lampHint');

    return hovered.kind === 'chair' ? this.#t('table.chairHint') : hovered.hint;
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

  markFontsReady(): void {
    this.fontsReady = true;
  }

  setInsets({ left, right, bottom }: TableInsets): void {
    this.insets = { left: Math.max(0, Math.round(left)), right: Math.max(0, Math.round(right)), bottom: Math.max(0, Math.round(bottom)) };
  }
}
