import { gameLimits, type CardRank } from '@bluff-table/protocol';
import { isTruthful } from '@bluff-table/engine';
import { makeAutoObservable } from 'mobx';
import type { CardArtService } from '../../../services';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';
import type { RoomGameMatchStore } from './match';

export interface RoomGameHandDeps {
  t: Translate;
  send: TableSend;
  match: RoomGameMatchStore;
  cardArt: CardArtService;
}

// One card in your hand, as shown: its picture, whether it tells the truth this round (marked, spec
// D22), whether you picked it, and a tooltip saying all that in words.
export interface HandCardView {
  id: string;
  rank: CardRank;
  image: string;
  truthful: boolean;
  picked: boolean;
  hint: string;
}

// Your cards (spec §9.2): pick up to three, then play them face down as the table card. Idle ⇄
// picking: the picks go when it's no longer your turn or the cards leave your hand.
export class RoomGameHandStore {
  picked: string[] = [];
  readonly #deps: RoomGameHandDeps;

  constructor(deps: RoomGameHandDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get cards(): HandCardView[] {
    const { match, cardArt } = this.#deps;
    const rank = match.tableRank;

    return match.hand.map((card) => {
      const truthful = rank !== null && isTruthful(card, rank);

      return { id: card.id, rank: card.rank, image: cardArt.face(card.rank), truthful, picked: this.picked.includes(card.id), hint: this.#hint(card.rank, truthful) };
    });
  }

  // You may pick cards: it's your turn and you're not forced to call.
  get canPick(): boolean {
    const { match } = this.#deps;

    return match.isMyTurn && !match.round?.forced;
  }

  get canPlay(): boolean {
    return this.canPick && this.picked.length >= 1 && this.picked.length <= gameLimits.playMax;
  }

  // "Play 2 as Queens", or what to do first.
  get playLabel(): string {
    const { t, match } = this.#deps;

    if (this.picked.length === 0) return t('round.hand.pickFirst');

    return t('round.hand.play', { count: this.picked.length, rank: match.rankLabel(this.picked.length > 1) });
  }

  // What playing them means, in one line (spec D22).
  get playHint(): string {
    const { t, match } = this.#deps;

    return t('round.hand.playHint', { rank: match.rankLabel() });
  }

  get isFull(): boolean {
    return this.picked.length >= gameLimits.playMax;
  }

  toggle(id: string): void {
    if (!this.canPick) return;

    if (this.picked.includes(id)) this.picked = this.picked.filter((other) => other !== id);
    else if (!this.isFull) this.picked = [...this.picked, id];
  }

  play(): void {
    if (!this.canPlay) return;

    this.#deps.send('play', { cardIds: [...this.picked] });
    this.picked = [];
  }

  // The table moved on: picks of cards you no longer hold, or picked out of turn, go.
  tidy(): void {
    const held = this.#deps.match.hand.map((card) => card.id);
    const kept = this.canPick ? this.picked.filter((id) => held.includes(id)) : [];

    if (kept.length !== this.picked.length) this.picked = kept;
  }

  #hint(rank: CardRank, truthful: boolean): string {
    const { t, match } = this.#deps;
    const name = t(`round.ranks.${rank}.one`);

    if (match.tableRank === null) return name;

    if (rank === 'joker') return t('round.hand.jokerHint');

    return t(truthful ? 'round.hand.truthfulHint' : 'round.hand.lieHint', { name, rank: match.rankLabel() });
  }
}
