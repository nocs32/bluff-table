import { gamePace, type PlayEvent, type SeatSnapshot } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../../services';
import type { Translate } from '../../locale';
import type { RuleBookSection } from '../../rule-book';
import type { RoomGameMatchStore } from './match';

export interface RoomGameCaptionsDeps {
  t: Translate;
  match: RoomGameMatchStore;
  schedule: Schedule;
}

// A line over the table saying what just happened, with the rule book's section about it (More).
export interface CaptionView {
  id: number;
  text: string;
  section: RuleBookSection | null;
  // Bigger news: a call, a bang, the end of a game.
  loud: boolean;
}

const showMs = 5200;
const maxShown = 3;

// The game explains itself as it goes (spec D22): what a call found, who pulls and at what odds, the
// click or the bang, the house after a whispered round, and your own timeouts. A few at a time,
// each for a few seconds. Lines about you say "you", in a sentence of their own, so both languages
// read right.
export class RoomGameCaptionsStore {
  items: CaptionView[] = [];
  #next = 1;
  // The seats a bot plays, as last seen (null: no game yet, so nothing to compare with).
  #standIns: Set<string> | null = null;
  // Verdicts waiting for the called cards to finish flipping.
  #pending: Array<() => void> = [];
  readonly #deps: RoomGameCaptionsDeps;

  constructor(deps: RoomGameCaptionsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  receive(events: readonly PlayEvent[]): void {
    events.forEach((event) => this.#explain(event));
  }

  // The game's seats changed: a line when a bot takes over someone's seat, or gives yours back.
  seats(seats: readonly SeatSnapshot[] | null): void {
    const before = this.#standIns;
    const now = new Set((seats ?? []).filter((seat) => seat.standIn && seat.alive).map((seat) => seat.id));

    this.#standIns = seats ? now : null;

    if (!before) return;

    now.forEach((id) => {
      if (!before.has(id)) this.#line('standIn', { name: id }, null, false);
    });

    if (before.has(this.#deps.match.meId) && !now.has(this.#deps.match.meId) && this.#deps.match.isAlive) this.#show(this.#deps.t('round.captions.standInBackYou'), null);
  }

  // A line from the room itself (a move turned down, say).
  note(text: string): void {
    if (text) this.#show(text, null);
  }

  dismiss(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
  }

  clear(): void {
    this.items = [];
    this.#standIns = null;
    this.#pending.forEach((cancel) => cancel());
    this.#pending = [];
  }

  #explain(event: PlayEvent): void {
    switch (event.type) {
      case 'dealt':
        return this.#dealt(event);
      case 'called':
        return this.#line(event.double ? 'calledDouble' : 'called', { name: event.seat, against: event.against }, 'liar', true);
      case 'revealed':
        return this.#afterFlip(event);
      case 'pulled':
        return this.#line(event.bang ? 'bang' : 'click', { name: event.seat }, 'revolver', event.bang);
      case 'gameOver':
        return this.#line('won', { name: event.winner }, null, true);
      case 'timedOut':
        return event.seat === this.#deps.match.meId ? this.#show(this.#deps.t(`round.captions.timedOut.${event.step === 'turn' ? 'turn' : 'pull'}`), 'turn') : undefined;
      default:
        return undefined;
    }
  }

  #dealt({ round, whispered }: Extract<PlayEvent, { type: 'dealt' }>): void {
    const { t, match } = this.#deps;

    this.#show(t('round.captions.dealt', { round, rank: match.rankLabel() }), 'tableCard');

    if (whispered) this.#line('whispered', { name: whispered }, 'whisper', false);
  }

  // The verdict waits until the last called card has turned over, so it never gives the flip away.
  #afterFlip(event: Extract<PlayEvent, { type: 'revealed' }>): void {
    const cancel = this.#deps.schedule(() => {
      this.#pending = this.#pending.filter((other) => other !== cancel);
      this.#revealed(event);
    }, event.cards.length * gamePace.revealCardMs + 150);

    this.#pending = [...this.#pending, cancel];
  }

  #revealed({ seat, lie, by }: Extract<PlayEvent, { type: 'revealed' }>): void {
    if (by === 'house') return this.#line('houseCheck', { name: seat }, 'whisper', true);

    this.#line(lie ? 'lie' : 'truth', { name: seat }, 'liar', true);
  }

  // A line that names people: `values` holds seat ids, turned into names, with a "You" version of
  // the line when the first one is you.
  #line(key: string, seats: Record<string, string>, section: RuleBookSection | null, loud: boolean): void {
    const { t, match } = this.#deps;
    const names = Object.fromEntries(Object.entries(seats).map(([name, id]) => [name, match.nameOf(id)]));
    const you = seats.name === match.meId || seats.against === match.meId;
    const which = seats.name === match.meId ? 'You' : seats.against === match.meId ? 'OnYou' : '';

    this.#show(t(`round.captions.${key}${you ? which : ''}` as Parameters<Translate>[0], names), section, loud);
  }

  #show(text: string, section: RuleBookSection | null, loud = false): void {
    const id = this.#next++;

    this.items = [...this.items, { id, text, section, loud }].slice(-maxShown);
    this.#deps.schedule(() => this.dismiss(id), showMs);
  }
}
