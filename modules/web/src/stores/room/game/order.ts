import type { PlayerColor, SeatSnapshot } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { PortraitService } from '../../../services';
import type { Translate } from '../../locale';
import type { RoomGameMatchStore } from './match';

export interface RoomGameOrderStoreDeps {
  t: Translate;
  match: RoomGameMatchStore;
  portraits: PortraitService;
}

// One seat in the turn order strip.
export interface TurnOrderSeat {
  id: string;
  name: string;
  portrait: string;
  color: PlayerColor;
  // It's their move: their turn, or their gun.
  isNow: boolean;
  // They're up after whoever moves now.
  isNext: boolean;
  isYou: boolean;
  isGhost: boolean;
  // A word under their face: "You", "Now", "Next", or nothing.
  tag: string;
  // What their face says when you point at it.
  title: string;
}

const turnSteps: ReadonlySet<string> = new Set(['turn', 'pull', 'pulling']);

// The turn order (spec D22): everyone's face in the order the turn goes round, starting with you,
// so you can see whose move it is now, who's next and how far off yours is.
export class RoomGameOrderStore {
  readonly #deps: RoomGameOrderStoreDeps;

  constructor(deps: RoomGameOrderStoreDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isShown(): boolean {
    return this.#deps.match.round !== null;
  }

  // Whose move it is now, while it's someone's to make.
  get #now(): string | null {
    const round = this.#deps.match.round;

    return round && turnSteps.has(round.step) ? round.turn : null;
  }

  // The seats from yours round the table, the way the turn goes.
  get #ordered(): SeatSnapshot[] {
    const { match } = this.#deps;
    const seats = match.seats;
    const at = seats.findIndex((seat) => seat.id === match.meId);

    return at < 0 ? seats : [...seats.slice(at), ...seats.slice(0, at)];
  }

  // The next living player with cards after whoever's turn it is.
  get #next(): string | null {
    const now = this.#now;
    const round = this.#deps.match.round;

    if (now === null || round?.step !== 'turn') return null;

    const seats = this.#deps.match.seats;
    const at = seats.findIndex((seat) => seat.id === now);
    const after = [...seats.slice(at + 1), ...seats.slice(0, at)];

    return after.find((seat) => seat.alive && seat.cards > 0)?.id ?? null;
  }

  get seats(): TurnOrderSeat[] {
    const { match, portraits } = this.#deps;

    return this.#ordered.map((seat) => {
      const isYou = seat.id === match.meId;
      const isNow = seat.id === this.#now;
      const isNext = seat.id === this.#next;

      return { id: seat.id, name: seat.name, portrait: portraits.portrait(seat.character, seat.color), color: seat.color, isNow, isNext, isYou, isGhost: !seat.alive, tag: this.#tag(isYou, isNow, isNext), title: this.#title(seat, isNow, isNext) };
    });
  }

  #tag(isYou: boolean, isNow: boolean, isNext: boolean): string {
    const { t } = this.#deps;

    if (isNow) return t('round.order.now');

    if (isYou) return t('round.order.you');

    return isNext ? t('round.order.next') : '';
  }

  // A line about them, in a sentence of its own when it's about you, so both languages read right.
  #title(seat: SeatSnapshot, isNow: boolean, isNext: boolean): string {
    const { t, match } = this.#deps;
    const you = seat.id === match.meId ? 'You' : '';
    const pulling = match.round?.step !== 'turn';
    const key = !seat.alive ? 'ghostTitle' : isNow ? (pulling ? 'pullTitle' : 'nowTitle') : isNext ? 'nextTitle' : 'waitTitle';

    return t(`round.order.${key}${you}` as Parameters<Translate>[0], { name: seat.name });
  }
}
