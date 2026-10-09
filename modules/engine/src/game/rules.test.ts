import { expect, test } from 'vitest';
import { applyMove, timeoutMove } from './apply.js';
import { nextRound } from './deal.js';
import { secretsFor } from './public.js';
import { cards, steady, testGame } from './test-game.js';
import type { GameState, Move, MoveResult, SeatId } from './types.js';

const ok = (result: MoveResult): Extract<MoveResult, { ok: true }> => {
  if (!result.ok) throw new Error(`refused: ${result.error}`);

  return result;
};

const move = (state: GameState, seat: SeatId, action: Move): Extract<MoveResult, { ok: true }> => ok(applyMove(state, seat, action, steady));

const idsOf = (state: GameState, seat: SeatId, count: number): string[] => (state.round.hands[seat] ?? []).slice(0, count).map((card) => card.id);

test('the first turn of a round can only play: there is nothing to call yet', () => {
  const state = testGame({ hands: { ann: cards('queen', 'king'), mo: cards('ace') } });

  expect(applyMove(state, 'ann', { type: 'call', double: false }, steady)).toEqual({ ok: false, error: 'NOTHING_TO_CALL' });
  expect(applyMove(state, 'mo', { type: 'play', cardIds: idsOf(state, 'mo', 1) }, steady)).toEqual({ ok: false, error: 'NOT_YOUR_TURN' });
});

test('a play puts 1 to 3 of your own cards down, and the turn goes to the next player with cards', () => {
  const state = testGame({ hands: { ann: cards('queen', 'king', 'ace', 'joker'), mo: [], dee: cards('ace'), zed: cards('king') }, dead: ['dee'] });

  expect(applyMove(state, 'ann', { type: 'play', cardIds: idsOf(state, 'ann', 4) }, steady)).toEqual({ ok: false, error: 'NOT_IN_HAND' });
  expect(applyMove(state, 'ann', { type: 'play', cardIds: ['nope'] }, steady)).toEqual({ ok: false, error: 'NOT_IN_HAND' });

  const { state: after, events } = move(state, 'ann', { type: 'play', cardIds: idsOf(state, 'ann', 2) });

  expect(after.round.hands.ann).toHaveLength(2);
  expect(after.round.turn).toBe('zed');
  expect(events).toEqual([{ type: 'played', seat: 'ann', cards: state.round.hands.ann?.slice(0, 2) }]);
});

test('holding the only cards left, you must call', () => {
  const played = cards('king');
  const state = testGame({ hands: { ann: cards('queen'), mo: [] }, plays: [{ seat: 'mo', cards: played }] });

  expect(applyMove(state, 'ann', { type: 'play', cardIds: idsOf(state, 'ann', 1) }, steady)).toEqual({ ok: false, error: 'MUST_CALL' });
  expect(timeoutMove(state, steady)).toEqual({ seat: 'ann', move: { type: 'call', double: false } });
});

test('Liar! on a lie: the liar pulls; on the truth: the caller pulls; Jokers are truthful', () => {
  const lie = testGame({ hands: { ann: cards('ace'), mo: cards('ace') }, turn: 'ann', plays: [{ seat: 'mo', cards: cards('queen', 'king') }] });
  const truth = testGame({ hands: { ann: cards('ace'), mo: cards('ace') }, turn: 'ann', plays: [{ seat: 'mo', cards: cards('queen', 'joker') }] });

  expect(move(lie, 'ann', { type: 'call', double: false }).state.step).toEqual({ kind: 'pull', seat: 'mo', pulls: 1, reason: 'lied' });
  expect(move(truth, 'ann', { type: 'call', double: false }).state.step).toEqual({ kind: 'pull', seat: 'ann', pulls: 1, reason: 'calledTruth' });
});

test('the crook is safe lying and shot for the truth, called or not', () => {
  const house = { seat: 'mo', crooked: true };
  const hands = { ann: cards('ace', 'ace'), mo: cards('ace'), dee: cards('king') };
  const lie = testGame({ hands, house, turn: 'dee', plays: [{ seat: 'mo', cards: cards('king') }] });
  const truth = testGame({ hands, house, turn: 'dee', plays: [{ seat: 'mo', cards: cards('queen') }] });

  expect(move(lie, 'dee', { type: 'call', double: false }).state.step).toMatchObject({ seat: 'dee', reason: 'calledCrook' });
  expect(move(truth, 'dee', { type: 'call', double: false }).state.step).toMatchObject({ seat: 'mo', reason: 'crookTruth' });

  // Nobody calls: the next player's move gets the crook's play checked by the house.
  const checked = move(truth, 'dee', { type: 'play', cardIds: idsOf(truth, 'dee', 1) });

  expect(checked.state.step).toEqual({ kind: 'pull', seat: 'mo', pulls: 1, reason: 'houseCheck' });
  expect(checked.events.map((event) => event.type)).toEqual(['played', 'revealed', 'mustPull']);
  expect(checked.state.round.lastMover).toBe('dee');
});

test('the whisper is told only to the whispered player, and only while the round lasts', () => {
  const state = testGame({ hands: { ann: cards('ace'), mo: cards('ace') }, house: { seat: 'mo', crooked: true } });

  expect(secretsFor(state, 'mo').crooked).toBe(true);
  expect(secretsFor(state, 'ann').crooked).toBeNull();
  expect(secretsFor({ ...state, step: { kind: 'roundOver' } }, 'mo').crooked).toBeNull();
});

test('a double call is a switch, once a game, and the loser pulls twice', () => {
  const setup = { hands: { ann: cards('ace'), mo: cards('ace') }, turn: 'ann', plays: [{ seat: 'mo', cards: cards('king') }] };

  expect(applyMove(testGame(setup), 'ann', { type: 'call', double: true }, steady)).toEqual({ ok: false, error: 'DOUBLE_OFF' });

  const state = testGame({ ...setup, switches: { doubleCall: true } });
  const called = move(state, 'ann', { type: 'call', double: true }).state;

  expect(called.step).toEqual({ kind: 'pull', seat: 'mo', pulls: 2, reason: 'lied' });
  expect(called.doubleUsed).toEqual(['ann']);
  expect(applyMove({ ...state, doubleUsed: ['ann'] }, 'ann', { type: 'call', double: true }, steady)).toEqual({ ok: false, error: 'DOUBLE_USED' });

  const first = move(called, 'mo', { type: 'pull' }).state;

  expect(first.step).toEqual({ kind: 'pull', seat: 'mo', pulls: 1, reason: 'lied' });
  expect(move(first, 'mo', { type: 'pull' }).state.step).toEqual({ kind: 'roundOver' });
});

test('the bullet fires on its chamber, and the last one alive wins at once, even mid-double', () => {
  const state = testGame({ hands: { ann: cards('ace'), mo: cards('ace') }, turn: 'ann', plays: [{ seat: 'mo', cards: cards('king') }], bullets: { mo: 1 }, used: { mo: 1 }, switches: { doubleCall: true } });
  const called = move(state, 'ann', { type: 'call', double: true }).state;
  const { state: after, events } = move(called, 'mo', { type: 'pull' });

  expect(events).toEqual([
    { type: 'pulled', seat: 'mo', bang: true, used: 2 },
    { type: 'roundOver', house: null },
    { type: 'gameOver', winner: 'ann' },
  ]);

  expect(after.step).toEqual({ kind: 'over', winner: 'ann' });
  expect(after.deaths).toEqual([{ seat: 'mo', round: 1 }]);
});

test('only whoever has the gun can pull it, and out of time it pulls itself', () => {
  const state = testGame({ hands: { ann: cards('ace'), mo: cards('ace') }, turn: 'ann', plays: [{ seat: 'mo', cards: cards('king') }] });
  const called = move(state, 'ann', { type: 'call', double: false }).state;

  expect(applyMove(called, 'ann', { type: 'pull' }, steady)).toEqual({ ok: false, error: 'NOT_YOUR_TURN' });
  expect(timeoutMove(called, steady)).toEqual({ seat: 'mo', move: { type: 'pull' } });
});

test('the next round starts with the next living player after whoever moved last', () => {
  const state = testGame({ hands: { ann: cards('ace'), mo: cards('ace'), dee: cards('queen') }, turn: 'mo', plays: [{ seat: 'ann', cards: cards('king') }] });
  const survived = move(move(state, 'mo', { type: 'call', double: false }).state, 'ann', { type: 'pull' }).state;

  expect(nextRound(survived, steady)?.state.round.turn).toBe('dee');

  // The caller called the truth and died: the round after starts with the player after them.
  const truth = testGame({ hands: { ann: cards('ace'), mo: cards('ace'), dee: cards('queen') }, turn: 'mo', plays: [{ seat: 'ann', cards: cards('queen') }], bullets: { mo: 0 } });
  const died = move(move(truth, 'mo', { type: 'call', double: false }).state, 'mo', { type: 'pull' }).state;

  expect(died.alive).toEqual(['ann', 'dee']);
  expect(nextRound(died, steady)?.state.round.turn).toBe('dee');
});

test('out of time on your turn, one random card from your hand is played for you', () => {
  const state = testGame({ hands: { ann: cards('ace', 'king'), mo: cards('ace') } });

  expect(timeoutMove(state, steady)).toEqual({ seat: 'ann', move: { type: 'play', cardIds: idsOf(state, 'ann', 1) } });
});
