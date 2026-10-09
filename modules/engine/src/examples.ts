// The rule book's examples (spec §9.4), worked out by the same rules the game plays by, so the book
// can never disagree with the table.
import type { CardRank, PullReason, TableRank } from '@bluff-table/protocol';
import { isTrue } from './cards.js';

export interface CallExample {
  tableRank: TableRank;
  cards: CardRank[];
  // The play's player is the crook this round (spec §5.8).
  crook: boolean;
}

export interface CallVerdict {
  lie: boolean;
  // Who pulls the trigger after the call: the one who played, or the caller.
  puller: 'player' | 'caller';
  reason: PullReason;
}

const card = (rank: CardRank, index: number): { id: string; rank: CardRank } => ({ id: `e${index}`, rank });

// What a call on this play finds, and who pulls (spec §5.5, §5.8).
export const callVerdict = ({ tableRank, cards, crook }: CallExample): CallVerdict => {
  const lie = !isTrue(cards.map(card), tableRank);

  if (crook) return lie ? { lie, puller: 'caller', reason: 'calledCrook' } : { lie, puller: 'player', reason: 'crookTruth' };

  return lie ? { lie, puller: 'player', reason: 'lied' } : { lie, puller: 'caller', reason: 'calledTruth' };
};

export const ruleBookExamples = {
  // Liar! and who pulls: the table card is Queens.
  calls: [
    { tableRank: 'queen', cards: ['queen', 'queen'], crook: false },
    { tableRank: 'queen', cards: ['queen', 'king'], crook: false },
    { tableRank: 'queen', cards: ['joker', 'queen', 'queen'], crook: false },
    { tableRank: 'queen', cards: ['ace'], crook: false },
  ],
  // The crook's round: lies are safe, the truth gets them shot.
  crook: [
    { tableRank: 'king', cards: ['ace', 'queen'], crook: true },
    { tableRank: 'king', cards: ['king'], crook: true },
  ],
  // Try it: a hand to pick from.
  tryHand: ['queen', 'king', 'joker', 'ace', 'queen'],
} as const satisfies { calls: CallExample[]; crook: CallExample[]; tryHand: CardRank[] };
