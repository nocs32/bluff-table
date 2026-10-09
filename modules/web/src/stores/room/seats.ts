import { seatSlots, tableLayout } from '@bluff-table/engine';
import { gameLimits } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../locale';
import type { PlayerView, RoomPresenceStore } from './presence';
import type { TableSend } from './types';

export interface RoomSeatsDeps {
  t: Translate;
  presence: RoomPresenceStore;
  send: TableSend;
  // Bots sit down and get up only in the lobby (spec §4.2).
  isLobby: () => boolean;
}

// One of the five places across the table (spec §9.2): someone sitting in it, or a free chair.
export interface PlaceView {
  // Where it is round the table, in degrees: 180 is straight across from you.
  angle: number;
  player: PlayerView | null;
}

// Someone's revolver lying on the felt in front of them (spec D15): where it is round the table,
// how many chambers are still to pull, and its tooltip saying so in words (spec D22).
export interface RevolverView {
  id: string;
  isMine: boolean;
  angle: number;
  left: number;
  hint: string;
}

// Who sits where, the bots, and whether there are enough players to start. You always sit at the
// near edge; the others follow round the table in the order they sat down (spec §9.2).
export class RoomSeatsStore {
  readonly #deps: RoomSeatsDeps;

  constructor(deps: RoomSeatsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get taken(): number {
    return this.#deps.presence.count;
  }

  get max(): number {
    return gameLimits.maxPlayers;
  }

  get isFull(): boolean {
    return this.taken >= this.max;
  }

  // Deal needs two seats filled, people or bots (spec §4.2).
  get isReady(): boolean {
    return this.taken >= gameLimits.minPlayers;
  }

  get canAddBot(): boolean {
    return this.#deps.isLobby() && !this.isFull;
  }

  get canRemoveBots(): boolean {
    return this.#deps.isLobby();
  }

  get bots(): PlayerView[] {
    return this.#deps.presence.bots;
  }

  // Everyone's place round the table as you see it: you at the near edge, the others across.
  get layout(): Map<string, number> {
    const { presence } = this.#deps;

    return tableLayout(presence.ids, presence.meId);
  }

  // The five chairs across the table, and who sits in each.
  get places(): PlaceView[] {
    const { layout } = this;
    const others = this.#deps.presence.views.filter((view) => !view.isMe);

    return seatSlots.map((angle) => ({ angle, player: others.find((view) => layout.get(view.id) === angle) ?? null }));
  }

  // Everyone's revolver, yours too. Before a game every cylinder is fresh; the rounds count the
  // pulls.
  get revolvers(): RevolverView[] {
    const { layout } = this;
    const left = gameLimits.chambers;

    return this.#deps.presence.views.map((view) => ({ id: view.id, isMine: view.isMe, angle: layout.get(view.id) ?? 0, left, hint: this.#revolverHint(view, left) }));
  }

  revolverOf(id: string): RevolverView | null {
    return this.revolvers.find((view) => view.id === id) ?? null;
  }

  get countLabel(): string {
    return this.#deps.t('lobby.seatsTaken', { taken: this.taken, max: this.max });
  }

  #revolverHint(view: PlayerView, left: number): string {
    const t = this.#deps.t;
    const owner = view.isMe ? t('table.revolverYours') : t('table.revolverOf', { name: view.name });
    const odds = left > 1 ? t('table.revolverOdds', { left }) : t('table.revolverCertain');

    return t('table.revolverHint', { owner, left, total: gameLimits.chambers, odds });
  }

  addBot(): void {
    if (this.canAddBot) this.#deps.send('addBot', {});
  }

  removeBot(id: string): void {
    if (this.canRemoveBots) this.#deps.send('removeBot', { memberId: id });
  }
}
