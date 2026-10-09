import { callVerdict, ruleBookExamples, type CallExample } from '@bluff-table/engine';
import { gameLimits, type CardRank } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { CardArtService, DeviceService } from '../../services';
import type { Translate } from '../locale';
import { sectionTexts } from './texts';
import { RuleBookTryStore } from './try';

// The rule book's sections, in reading order (spec §9.4).
export const ruleBookSections = ['goal', 'tableCard', 'turn', 'liar', 'revolver', 'forced', 'ghosts', 'whisper', 'double', 'faces'] as const;

export type RuleBookSection = (typeof ruleBookSections)[number];

// closed ⇄ open. It never pauses the game (spec §9.4).
export type RuleBookState = 'closed' | 'open';

// A request to bring a section into view: from a tab, or from opening the book at a place. `count`
// makes each request new, even for the same place twice.
export interface RuleBookJump {
  section: RuleBookSection;
  smooth: boolean;
  count: number;
}

export interface RuleBookTab {
  section: RuleBookSection;
  number: number;
  label: string;
  isCurrent: boolean;
}

// A card in the book: its picture and its name.
export interface BookCard {
  key: string;
  image: string;
  label: string;
}

// One worked example of a call (spec §9.4): the play, whether it was the truth, and who pulls.
export interface CallExampleView {
  key: string;
  cards: BookCard[];
  lie: boolean;
  verdict: string;
  claim: string;
}

// A section's words, translated.
export interface SectionWords {
  lead: string;
  before: string[];
  after: string[];
}

export interface RuleBookDeps {
  t: Translate;
  cardArt: CardArtService;
  device: DeviceService;
}

// The rule book (spec D23, §9.4): a saloon handbill that explains everything from scratch, one
// click away from the top bar, the lobby, every switch's (?) and every caption. One long page to
// scroll; the tabs down the side follow where you are, and take you to a section.
export class RuleBookStore {
  state: RuleBookState = 'closed';
  section: RuleBookSection = 'goal';
  jump: RuleBookJump | null = null;
  readonly tryIt: RuleBookTryStore;
  readonly #deps: RuleBookDeps;

  constructor(deps: RuleBookDeps) {
    this.#deps = deps;
    this.tryIt = new RuleBookTryStore({ t: deps.t, cardArt: deps.cardArt, hand: ruleBookExamples.tryHand });
    makeAutoObservable(this, { tryIt: false }, { autoBind: true });
  }

  get isOpen(): boolean {
    return this.state === 'open';
  }

  get isTouch(): boolean {
    return this.#deps.device.isTouch();
  }

  get chambers(): number {
    return gameLimits.chambers;
  }

  get tabs(): RuleBookTab[] {
    return ruleBookSections.map((section, index) => ({ section, number: index + 1, label: this.#deps.t(`book.sections.${section}`), isCurrent: section === this.section }));
  }

  words(section: RuleBookSection): SectionWords {
    const { t } = this.#deps;
    const texts = sectionTexts[section];

    return { lead: t(texts.lead), before: texts.before.map((key) => t(key)), after: texts.after.map((key) => t(key)) };
  }

  tab(section: RuleBookSection): RuleBookTab | undefined {
    return this.tabs.find((tab) => tab.section === section);
  }

  // The cards there are, for the table card section.
  get ranks(): BookCard[] {
    return (['king', 'queen', 'ace', 'joker'] as const).map((rank) => this.#card(rank, rank));
  }

  get calls(): CallExampleView[] {
    return ruleBookExamples.calls.map((example, index) => this.#example(example, `call${index}`));
  }

  get crookCalls(): CallExampleView[] {
    return ruleBookExamples.crook.map((example, index) => this.#example(example, `crook${index}`));
  }

  // The odds of each pull, from a fresh cylinder to the sixth.
  get odds(): string[] {
    return Array.from({ length: gameLimits.chambers }, (_, used) => {
      const left = gameLimits.chambers - used;

      return left > 1 ? this.#deps.t('book.revolver.odds', { pull: used + 1, left }) : this.#deps.t('book.revolver.last', { pull: used + 1 });
    });
  }

  // Opens at the start, or straight at a section.
  open(section: RuleBookSection = 'goal'): void {
    this.state = 'open';
    this.#jumpTo(section, false);
  }

  close(): void {
    this.state = 'closed';
  }

  // Ark's dialog reports Escape, the backdrop and the close button here.
  setOpen(open: boolean): void {
    if (open) this.open();
    else this.close();
  }

  // A tab: scrolls to its section.
  goTo(section: RuleBookSection): void {
    this.#jumpTo(section, true);
  }

  // Scrolling brought another section into view.
  see(section: RuleBookSection): void {
    this.section = section;
  }

  #jumpTo(section: RuleBookSection, smooth: boolean): void {
    this.section = section;
    this.jump = { section, smooth, count: (this.jump?.count ?? 0) + 1 };
  }

  #card(rank: CardRank, key: string): BookCard {
    return { key, image: this.#deps.cardArt.face(rank), label: this.#deps.t(`round.ranks.${rank}.one`) };
  }

  #example(example: CallExample, key: string): CallExampleView {
    const { t } = this.#deps;
    const verdict = callVerdict(example);
    const rank = t(`round.ranks.${example.tableRank}.many`);

    return {
      key,
      cards: example.cards.map((rankOf, index) => this.#card(rankOf, `${key}-${index}`)),
      lie: verdict.lie,
      claim: t('book.liar.claim', { count: example.cards.length, rank }),
      verdict: t(`book.verdict.${verdict.reason}`),
    };
  }
}
