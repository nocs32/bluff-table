import { isTrue } from '@bluff-table/engine';
import { gameLimits, tableRanks, type CardRank, type TableRank } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { CardArtService } from '../../services';
import type { Translate } from '../locale';

export interface RuleBookTryDeps {
  t: Translate;
  cardArt: CardArtService;
  hand: readonly CardRank[];
}

export interface TryCardView {
  index: number;
  image: string;
  label: string;
  picked: boolean;
}

export interface TryRankView {
  rank: TableRank;
  label: string;
  isCurrent: boolean;
}

// "Try it" (spec §9.4): a hand and a table card; pick up to three cards and the engine says whether
// that play would be the truth or a lie, and who'd pull if it were called.
export class RuleBookTryStore {
  tableRank: TableRank = 'queen';
  picked: number[] = [];
  readonly #deps: RuleBookTryDeps;

  constructor(deps: RuleBookTryDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get cards(): TryCardView[] {
    const { t, cardArt, hand } = this.#deps;

    return hand.map((rank, index) => ({ index, image: cardArt.face(rank), label: t(`round.ranks.${rank}.one`), picked: this.picked.includes(index) }));
  }

  get ranks(): TryRankView[] {
    return tableRanks.map((rank) => ({ rank, label: this.#deps.t(`round.ranks.${rank}.many`), isCurrent: rank === this.tableRank }));
  }

  // What playing the picked cards would be.
  get verdict(): { text: string; lie: boolean | null } {
    const { t, hand } = this.#deps;

    if (this.picked.length === 0) return { text: t('book.try.pick'), lie: null };

    const cards = this.picked.map((index) => ({ id: `try${index}`, rank: hand[index] ?? 'joker' }));
    const lie = !isTrue(cards, this.tableRank);
    const values = { count: cards.length, rank: t(`round.ranks.${this.tableRank}.many`) };

    return { text: t(lie ? 'book.try.lie' : 'book.try.truth', values), lie };
  }

  toggle(index: number): void {
    if (this.picked.includes(index)) this.picked = this.picked.filter((other) => other !== index);
    else if (this.picked.length < gameLimits.playMax) this.picked = [...this.picked, index];
  }

  setRank(rank: TableRank): void {
    this.tableRank = rank;
  }
}
