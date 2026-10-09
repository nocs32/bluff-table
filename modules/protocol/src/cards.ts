// The cards (spec §5.1): Kings, Queens and Aces, and a few Jokers that always count as the table
// card. No suits, no numbers: a card is its rank.

// What a round's plays all claim to be (spec §5.3).
export const tableRanks = ['king', 'queen', 'ace'] as const;

export type TableRank = (typeof tableRanks)[number];

export const cardRanks = [...tableRanks, 'joker'] as const;

export type CardRank = (typeof cardRanks)[number];

// `id` is the card's own for the game (c0, c1, …), so a play names the cards it puts down.
export interface Card {
  id: string;
  rank: CardRank;
}

// The deck for the table's size (D10): 20 cards for 2–4 players, 30 for 5–6, always 40% truthful
// cards whatever the table card is.
export const deckSizes = {
  small: { players: 4, each: 6, jokers: 2 },
  large: { players: 6, each: 9, jokers: 3 },
} as const;

// How many cards each living player gets each round.
export const handSize = 5;
