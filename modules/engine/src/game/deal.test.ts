import { expect, test } from 'vitest';
import { buildDeck, isTrue, truthfulInDeck } from '../cards.js';
import { createRandom } from '../random.js';
import { applyMove } from './apply.js';
import { dealRound, startGame } from './deal.js';
import { cards } from './test-game.js';

const off = { whisper: false, doubleCall: false };

test('20 cards for up to four players, 30 for five or six, always 40% truthful', () => {
  expect(buildDeck(2)).toHaveLength(20);
  expect(buildDeck(4)).toHaveLength(20);
  expect(buildDeck(5)).toHaveLength(30);
  expect(buildDeck(6)).toHaveLength(30);
  expect(truthfulInDeck(20)).toBe(8);
  expect(truthfulInDeck(30)).toBe(12);
  expect(buildDeck(6).filter((card) => card.rank === 'joker')).toHaveLength(3);
});

test('a play is true only when every card is the table card or a Joker', () => {
  expect(isTrue(cards('queen', 'joker', 'queen'), 'queen')).toBe(true);
  expect(isTrue(cards('queen', 'king'), 'queen')).toBe(false);
  expect(isTrue(cards('joker'), 'ace')).toBe(true);
});

test('a game deals five cards to everyone, loads one bullet each, and leaves the rest face down', () => {
  const { state, events } = startGame({ seats: ['ann', 'mo', 'dee'], switches: off, random: createRandom(4) });

  expect(Object.values(state.round.hands).map((hand) => hand.length)).toEqual([5, 5, 5]);
  expect(state.round.leftover).toHaveLength(5);
  expect(Object.values(state.revolvers).every((revolver) => revolver.used === 0 && revolver.bullet >= 0 && revolver.bullet < 6)).toBe(true);
  expect(events).toEqual([{ type: 'dealt', round: 1, tableRank: state.round.tableRank, first: state.round.turn, house: null }]);
});

test('the barkeep never whispers to the same player twice in a row', () => {
  const random = createRandom(9);
  let { state } = startGame({ seats: ['ann', 'mo'], switches: { whisper: true, doubleCall: false }, random });
  const whispered = [state.round.house?.seat];

  for (let round = 0; round < 12; round++) {
    state = dealRound(state, 'ann', random).state;
    whispered.push(state.round.house?.seat);
  }

  whispered.slice(1).forEach((seat, index) => expect(seat).not.toBe(whispered[index]));
});

test('the dead get no cards, and the deck stays the same size all game', () => {
  const random = createRandom(2);
  const { state } = startGame({ seats: ['ann', 'mo', 'dee'], switches: off, random });
  const next = dealRound({ ...state, alive: ['ann', 'dee'] }, 'ann', random).state;

  expect(next.round.hands.mo).toBeUndefined();
  expect(next.round.leftover).toHaveLength(10);
  expect(applyMove(next, 'mo', { type: 'pull' }, random)).toEqual({ ok: false, error: 'NOT_PLAYING' });
});
