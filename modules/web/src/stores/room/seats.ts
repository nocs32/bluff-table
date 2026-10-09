import { seatSlots, tableLayout } from '@bluff-table/engine';
import { gameLimits, type Character, type PlayerColor, type SeatSnapshot } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../locale';
import type { RoomGameMatchStore } from './game/match';
import type { PlayerView, RoomPresenceStore } from './presence';
import type { TableSend } from './types';

export interface RoomSeatsDeps {
  t: Translate;
  presence: RoomPresenceStore;
  match: RoomGameMatchStore;
  send: TableSend;
  // Bots sit down and get up only in the lobby (spec §4.2).
  isLobby: () => boolean;
}

// Whoever sits in a place: someone at the table in the lobby, or a seat in the game (kept if its
// person leaves, with a bot playing it).
export interface Occupant {
  id: string;
  name: string;
  color: PlayerColor;
  character: Character;
  // The name on their tag: with a 🤖 while a bot plays their seat (spec §4.5).
  tag: string;
}

// One of the five places across the table (spec §9.2): someone sitting in it, or a free chair. In a
// game, `seat` is how they're doing: alive or a ghost, their cards and their cylinder.
export interface PlaceView {
  // Where it is round the table, in degrees: 180 is straight across from you.
  angle: number;
  player: Occupant | null;
  seat: SeatSnapshot | null;
  // It's their turn: their name tag stands up taller (spec D22).
  isTurn: boolean;
}

// Someone's revolver lying on the felt in front of them (spec D15): where it is round the table,
// how many chambers are still to pull, and its tooltip saying so in words (spec D22). It's off the
// felt while its owner has it to their head.
export interface RevolverView {
  id: string;
  isMine: boolean;
  angle: number;
  left: number;
  hint: string;
  inHand: boolean;
}

const occupantOf = ({ id, name, color, character, standIn }: Omit<Occupant, 'tag'> & { standIn?: boolean }): Occupant => ({
  id,
  name,
  color,
  character,
  tag: standIn ? `🤖 ${name}` : name,
});

// Who sits where, the bots, and whether there are enough players to start. You always sit at the
// near edge; the others follow round the table in the order they sat down (spec §9.2). In a game,
// the game's seats are the table: someone who joins mid-game watches.
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

  // Everyone round the table, in order: the game's seats, or everyone here in the lobby.
  get order(): string[] {
    const { match, presence } = this.#deps;

    return match.match ? match.seatIds : presence.ids;
  }

  // Everyone's place round the table as you see it: you at the near edge, the others across.
  get layout(): Map<string, number> {
    return tableLayout(this.order, this.#deps.presence.meId);
  }

  get occupants(): Occupant[] {
    const { match, presence } = this.#deps;

    return match.match ? match.seats.map(occupantOf) : presence.views.map(occupantOf);
  }

  // The five chairs across the table, and who sits in each.
  get places(): PlaceView[] {
    const { layout } = this;
    const meId = this.#deps.presence.meId;
    const others = this.occupants.filter((occupant) => occupant.id !== meId);

    return seatSlots.map((angle) => {
      const player = others.find((occupant) => layout.get(occupant.id) === angle) ?? null;

      const round = this.#deps.match.round;

      return { angle, player, seat: player ? this.#deps.match.seat(player.id) : null, isTurn: player !== null && round?.step === 'turn' && round.turn === player.id };
    });
  }

  // Everyone's revolver, yours too. Before a game every cylinder is fresh.
  get revolvers(): RevolverView[] {
    const { layout } = this;
    const { match } = this.#deps;
    const meId = this.#deps.presence.meId;
    const gunOut = match.round?.step === 'pull' || match.round?.step === 'pulling';

    return this.occupants
      .filter((occupant) => layout.has(occupant.id))
      .map((occupant) => {
        const left = gameLimits.chambers - (match.seat(occupant.id)?.used ?? 0);

        return { id: occupant.id, isMine: occupant.id === meId, angle: layout.get(occupant.id) ?? 0, left, hint: this.#revolverHint(occupant, left), inHand: gunOut && match.puller === occupant.id };
      });
  }

  // The guns lying on the felt: all but one at someone's head.
  get revolversOnFelt(): RevolverView[] {
    return this.revolvers.filter((view) => !view.inHand);
  }

  revolverOf(id: string): RevolverView | null {
    return this.revolvers.find((view) => view.id === id) ?? null;
  }

  get countLabel(): string {
    return this.#deps.t('lobby.seatsTaken', { taken: this.taken, max: this.max });
  }

  #revolverHint(occupant: Occupant, left: number): string {
    const t = this.#deps.t;
    const owner = occupant.id === this.#deps.presence.meId ? t('table.revolverYours') : t('table.revolverOf', { name: occupant.name });
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
