// The bots (spec §6): functions of what a seat may see (`SeatView`), so they can't cheat. The demo
// table, live tables and the simulations run the same code.
import { gameLimits, type Card } from '@bluff-table/protocol';
import { isTruthful, truthfulInDeck } from './cards.js';
import type { Move } from './game/types.js';
import type { SeatView } from './game/view.js';
import { shuffle } from './random.js';

// Each thinking bot gets one at random, so bots are worth reading (spec §6): honest ones rarely
// lie and call often, bold ones lie a lot and play three at a time, paranoid ones call a lot.
export const botPersonalities = ['honest', 'bold', 'paranoid'] as const;

export type BotPersonality = (typeof botPersonalities)[number];

interface Traits {
  // How suspicious a play must look before they call it.
  callAt: number;
  // How often they lie while holding the truth.
  lieRate: number;
  // The most cards they put down at once.
  most: number;
}

const traits: Record<BotPersonality, Traits> = {
  honest: { callAt: 0.52, lieRate: 0.12, most: 2 },
  bold: { callAt: 0.62, lieRate: 0.5, most: 3 },
  paranoid: { callAt: 0.38, lieRate: 0.28, most: 2 },
};

const between = (random: () => number, low: number, high: number): number => low + Math.floor(random() * (high - low + 1));

const ids = (cards: readonly Card[]): string[] => cards.map((card) => card.id);

// The simplest bot (spec §6.1, layer 1): any legal move, calling now and then.
export const randomMove = (view: SeatView, random: () => number): Move => {
  if (view.forced || (!view.opening && random() < 0.25)) return { type: 'call', double: false };

  const count = between(random, 1, Math.min(gameLimits.playMax, view.hand.length));

  return { type: 'play', cardIds: ids(shuffle(view.hand, random).slice(0, count)) };
};

// How likely the play on top is a lie, from what this seat can count (spec §6): its size, how many
// truthful cards the others have claimed against how many this seat knows are out there, and the
// player's cylinder (close to the end, they'd better not be lying).
export const suspicion = (view: SeatView): number => {
  const last = view.plays.at(-1);

  if (!last) return 0;

  const outThere = truthfulInDeck(view.deckSize) - view.hand.filter((card) => isTruthful(card, view.tableRank)).length;
  const claimed = view.plays.filter((play) => play.seat !== view.seat).reduce((sum, play) => sum + play.count, 0);
  const base = [0, 0.2, 0.36, 0.52][last.count] ?? 0.52;
  const crowded = claimed > outThere ? 0.45 : (0.25 * claimed) / Math.max(1, outThere);
  const whispered = view.whispered === last.seat && view.crooked === null ? -0.12 : 0;

  return Math.min(1, Math.max(0, base + crowded + whispered + 0.04 * (view.used[last.seat] ?? 0)));
};

const call = (view: SeatView, sure: number, random: () => number): Move => ({ type: 'call', double: view.canDouble && sure > 0.8 && random() < 0.5 });

// Their play: the truth when they have it (unless they feel bold), a lie when they must.
const play = (view: SeatView, trait: Traits, random: () => number): Move => {
  const truthful = shuffle(view.hand.filter((card) => isTruthful(card, view.tableRank)), random);
  const lies = shuffle(view.hand.filter((card) => !isTruthful(card, view.tableRank)), random);
  const most = Math.min(trait.most, view.hand.length);

  if (truthful.length > 0 && (lies.length === 0 || random() >= trait.lieRate)) return { type: 'play', cardIds: ids(truthful.slice(0, between(random, 1, Math.min(most, truthful.length)))) };

  return { type: 'play', cardIds: ids([...lies, ...truthful].slice(0, between(random, 1, most))) };
};

// The crook must lie (spec §5.8): lies, padded with a truthful card now and then; stuck with only
// the truth, they call if they can.
const crook = (view: SeatView, random: () => number): Move => {
  const truthful = view.hand.filter((card) => isTruthful(card, view.tableRank));
  const lies = shuffle(view.hand.filter((card) => !isTruthful(card, view.tableRank)), random);

  if (lies.length === 0) return view.opening ? { type: 'play', cardIds: ids(truthful.slice(0, 1)) } : { type: 'call', double: false };

  const pad = truthful.length > 0 && random() < 0.4 ? truthful.slice(0, 1) : [];

  return { type: 'play', cardIds: ids([...lies.slice(0, between(random, 1, Math.min(2, lies.length))), ...pad]) };
};

// The thinking bot (spec §6.1, layer 2).
export const botMove = (view: SeatView, personality: BotPersonality, random: () => number): Move => {
  const sure = suspicion(view);

  if (view.forced) return call(view, sure, random);

  if (view.crooked) return crook(view, random);

  const trait = traits[personality];
  const stuck = view.hand.every((card) => !isTruthful(card, view.tableRank)) ? 0.12 : 0;
  const nerve = 0.03 * (view.used[view.seat] ?? 0) + (random() - 0.5) * 0.12;

  if (!view.opening && sure + stuck > trait.callAt + nerve) return call(view, sure, random);

  return play(view, trait, random);
};
