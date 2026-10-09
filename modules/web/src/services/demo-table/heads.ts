import { angleOfLook, lookAtMember, tableLayout } from '@bluff-table/engine';
import type { TableFaceEvent, TableLookEvent } from '@bluff-table/protocol';
import { DemoPlans } from './plans';
import type { DemoDeps, DemoMember } from './types';

export interface DemoHeadsHost {
  members: () => readonly DemoMember[];
  look: (event: TableLookEvent) => void;
  face: (event: TableFaceEvent) => void;
}

// How long you stare at someone before they stare back (spec §7.1), and how long they do.
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

// The sample players' and bots' heads at the demo table (spec §6, §7.1): every couple of seconds
// they glance at someone or something, and when you stare at one of them for about a second, they
// stare back with a suspicious face. The server does the same for bots at live tables (M2).
export class DemoHeads {
  readonly #deps: DemoDeps;
  readonly #host: DemoHeadsHost;
  readonly #plans: DemoPlans<string>;
  #staredAt: string | null = null;

  constructor(deps: DemoDeps, host: DemoHeadsHost) {
    this.#deps = deps;
    this.#host = host;
    this.#plans = new DemoPlans(deps.schedule);
  }

  start(member: DemoMember): void {
    this.#plans.later(member.id, 400 + this.#deps.random() * 1200, () => this.#glance(member.id));
  }

  stop(memberId: string): void {
    this.#plans.cancel(memberId);
  }

  // Where your own head points: someone you keep looking at stares back.
  mine(meId: string, x: number, y: number): void {
    const target = this.#aimedAt(meId, x, y);

    if (target === this.#staredAt) return;

    this.#staredAt = target;
    this.#plans.cancel('stare');

    if (target) this.#plans.later('stare', stareMs, () => this.#stareBack(target, meId));
  }

  dispose(): void {
    this.#plans.cancelAll();
  }

  #aimedAt(meId: string, x: number, y: number): string | null {
    const members = this.#host.members();
    const layout = tableLayout(members.map((member) => member.id), meId);
    const angle = angleOfLook(x);

    if (y < aimHeight.low || y > aimHeight.high) return null;

    return members.find((member) => member.id !== meId && Math.abs((layout.get(member.id) ?? -99) - angle) < aimDegrees)?.id ?? null;
  }

  #stareBack(memberId: string, meId: string): void {
    const ids = this.#host.members().map((member) => member.id);

    this.#plans.cancel(memberId);
    this.#host.look({ memberId, x: lookAtMember(ids, memberId, meId), y: 0.05 });
    this.#host.face({ memberId, mood: 'suspicious' });

    this.#plans.later(memberId, stareBackMs, () => {
      this.#host.face({ memberId, mood: 'idle' });
      this.#glance(memberId);
    });
  }

  #glance(memberId: string): void {
    const { random } = this.#deps;
    const members = this.#host.members();
    const ids = members.map((member) => member.id);
    const others = ids.filter((id) => id !== memberId);
    const pick = Math.floor(random() * (others.length + places.length));
    const person = others[pick];
    const place = places[pick - others.length] ?? places[0];

    if (person) this.#host.look({ memberId, x: lookAtMember(ids, memberId, person), y: random() * 0.2 - 0.05 });
    else this.#host.look({ memberId, x: place.x + (random() * 2 - 1) * place.spread, y: place.y });

    this.#plans.later(memberId, 1400 + random() * 2400, () => this.#glance(memberId));
  }
}
