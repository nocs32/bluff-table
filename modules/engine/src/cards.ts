// The cards (spec §5.1): the deck for the table's size, and what's truthful.
import { deckSizes, tableRanks, type Card, type CardRank, type TableRank } from '@bluff-table/protocol';

// The deck for `players` at the start of a game (D10): 20 cards for 2–4, 30 for 5–6.
export const buildDeck = (players: number): Card[] => {
  const { each, jokers } = players <= deckSizes.small.players ? deckSizes.small : deckSizes.large;
  const ranks: CardRank[] = [...tableRanks.flatMap((rank) => Array.from({ length: each }, () => rank)), ...Array.from({ length: jokers }, (): CardRank => 'joker')];

  return ranks.map((rank, index) => ({ id: `c${index}`, rank }));
};

// A card of the table card's rank, or a Joker: Jokers always count as the table card.
export const isTruthful = (card: Card, tableRank: TableRank): boolean => card.rank === tableRank || card.rank === 'joker';

// A play is true only if every card in it is truthful; one lie makes it a lie.
export const isTrue = (cards: readonly Card[], tableRank: TableRank): boolean => cards.every((card) => isTruthful(card, tableRank));

// How many cards in a play are lies.
export const liesIn = (cards: readonly Card[], tableRank: TableRank): number => cards.filter((card) => !isTruthful(card, tableRank)).length;

// How many truthful cards a deck of `size` holds for any table card: a rank's cards and the Jokers.
export const truthfulInDeck = (size: number): number => {
  const { each, jokers } = size <= deckSizes.small.each * 3 + deckSizes.small.jokers ? deckSizes.small : deckSizes.large;

  return each + jokers;
};
