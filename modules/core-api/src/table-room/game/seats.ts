import { rollCharacter } from '@bluff-table/engine';
import type { Character, PlayerColor } from '@bluff-table/protocol';

// Who sits in a seat, as the game started: kept for the game if they leave.
export interface TableRoomGameHolder {
  id: string;
  name: string;
  color: PlayerColor;
  character: Character;
}

// Two timeouts in a row and a bot plays your seat until you move again (spec §4.5).
const timeoutsBeforeStandIn = 2;

// The seats of the game being played (spec §4.3, §4.5): who holds each one, and which ones a bot is
// playing for their person, because they left or ran out of time twice in a row. Lives from the
// deal to the end of the game.
export class TableRoomGameSeats {
  ids: string[] = [];
  readonly #holders = new Map<string, TableRoomGameHolder>();
  // People whose seat a bot is playing.
  readonly standIns = new Set<string>();
  readonly #timeouts = new Map<string, number>();

  // A new game with these people and bots.
  seat(holders: readonly TableRoomGameHolder[]): void {
    this.ids = holders.map((holder) => holder.id);
    this.#holders.clear();
    this.standIns.clear();
    this.#timeouts.clear();
    holders.forEach((holder) => this.#holders.set(holder.id, { ...holder }));
  }

  // Nobody's playing.
  clear(): void {
    this.seat([]);
  }

  has(id: string): boolean {
    return this.ids.includes(id);
  }

  // Who holds a seat (every seat of the game has one; anyone else gets a blank).
  holder(id: string): TableRoomGameHolder {
    return this.#holders.get(id) ?? { id, name: '', color: 'teal', character: rollCharacter(() => 0) };
  }

  // A person made a move themselves: they're back.
  acted(id: string): void {
    this.#timeouts.delete(id);
    this.standIns.delete(id);
  }

  timedOut(id: string): void {
    const count = (this.#timeouts.get(id) ?? 0) + 1;

    this.#timeouts.set(id, count);

    if (count >= timeoutsBeforeStandIn) this.standIns.add(id);
  }

  // They left for good: a bot plays the rest of their game (spec §4.5).
  dropOut(id: string): void {
    if (this.has(id)) this.standIns.add(id);
  }
}
