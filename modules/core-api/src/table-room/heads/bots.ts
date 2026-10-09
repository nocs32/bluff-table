import { angleOfLook, lookAtMember, tableLayout } from '@bluff-table/engine';
import type { Mood } from '@bluff-table/protocol';
import type { Schedule } from '../lifecycle.js';

export interface TableRoomHeadsBotsDeps {
  schedule: Schedule;
  random: () => number;
  // Everyone round the table, in order: the game's seats, or everyone here in the lobby.
  order: () => readonly string[];
  // A bot's head turns, or it pulls a face.
  look: (memberId: string, x: number, y: number) => void;
  face: (memberId: string, mood: Mood) => void;
}

// How long someone stares at a bot before it stares back (spec §7.1), and how long it does.
const stareMs = 900;
const stareBackMs = 2600;
// How close to someone's place a look must be to count as looking at them, in degrees round the
// table, and how far up or down.
const aimDegrees = 14;
const aimHeight = { low: -0.45, high: 0.65 };

// The other things a head looks at, besides people: the felt, its own cards, the lamp.
const places = [
  { x: 0, y: -0.55, spread: 0.12 },
  { x: 0, y: -0.85, spread: 0.04 },
  { x: 0, y: 0.7, spread: 0.08 },
] as const;

// What one person is staring at, and the stare back it will set off.
interface TableRoomHeadsBotsStare {
  target: string;
  cancel: () => void;
}

// The bots' heads (spec §6, §7.1), as at the demo table: every couple of seconds a bot glances at
// someone or something, and when someone stares at a bot for about a second, it stares back with a
// suspicious face. Ghost bots too. A new look every second or so, smoothed in every browser.
export class TableRoomHeadsBots {
  readonly #glances = new Map<string, () => void>();
  readonly #stares = new Map<string, TableRoomHeadsBotsStare>();
  readonly #deps: TableRoomHeadsBotsDeps;

  constructor(deps: TableRoomHeadsBotsDeps) {
    this.#deps = deps;
  }

  // The bots at the table now: new ones start looking about, gone ones stop.
  seat(botIds: readonly string[]): void {
    [...this.#glances.keys()].filter((id) => !botIds.includes(id)).forEach((id) => this.#stop(id));
    botIds.filter((id) => !this.#glances.has(id)).forEach((id) => this.#later(id, 400 + this.#deps.random() * 1200, () => this.#glance(id)));
  }

  // Where a person's head points: a bot they keep looking at stares back.
  watch(memberId: string, x: number, y: number): void {
    const target = this.#aimedAt(memberId, x, y);

    if (target === (this.#stares.get(memberId)?.target ?? null)) return;

    this.#stares.get(memberId)?.cancel();
    this.#stares.delete(memberId);

    if (target) this.#stares.set(memberId, { target, cancel: this.#deps.schedule(() => this.#stareBack(target, memberId), stareMs) });
  }

  forget(memberId: string): void {
    this.#stares.get(memberId)?.cancel();
    this.#stares.delete(memberId);
    this.#stop(memberId);
  }

  dispose(): void {
    [...this.#stares.keys(), ...this.#glances.keys()].forEach((id) => this.forget(id));
  }

  #later(botId: string, delayMs: number, then: () => void): void {
    this.#glances.get(botId)?.();
    this.#glances.set(botId, this.#deps.schedule(then, delayMs));
  }

  #stop(botId: string): void {
    this.#glances.get(botId)?.();
    this.#glances.delete(botId);
  }

  #aimedAt(memberId: string, x: number, y: number): string | null {
    const order = this.#deps.order();
    const layout = tableLayout(order, memberId);
    const angle = angleOfLook(x);

    if (y < aimHeight.low || y > aimHeight.high || !order.includes(memberId)) return null;

    return order.find((id) => id !== memberId && this.#glances.has(id) && Math.abs((layout.get(id) ?? -99) - angle) < aimDegrees) ?? null;
  }

  #stareBack(botId: string, memberId: string): void {
    this.#stares.delete(memberId);

    if (!this.#glances.has(botId)) return;

    this.#deps.look(botId, lookAtMember(this.#deps.order(), botId, memberId), 0.05);
    this.#deps.face(botId, 'suspicious');
    this.#later(botId, stareBackMs, () => this.#glance(botId));
  }

  #glance(botId: string): void {
    const { random } = this.#deps;
    const order = this.#deps.order();
    const others = order.filter((id) => id !== botId);
    const pick = Math.floor(random() * (others.length + places.length));
    const person = others[pick];
    const place = places[pick - others.length] ?? places[0];

    if (person) this.#deps.look(botId, lookAtMember(order, botId, person), random() * 0.2 - 0.05);
    else this.#deps.look(botId, place.x + (random() * 2 - 1) * place.spread, place.y);

    this.#later(botId, 1400 + random() * 2400, () => this.#glance(botId));
  }
}
