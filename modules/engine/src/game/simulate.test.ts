import { gameSwitches, type GameSwitches } from '@bluff-table/protocol';
import { expect, test } from 'vitest';
import { createRandom } from '../random.js';
import { simulateGame, type Brain } from './simulate.js';

const brainsFor = (count: number, pick: (index: number) => Brain): Record<string, Brain> => Object.fromEntries(Array.from({ length: count }, (_, index) => [`s${index}`, pick(index)]));

// Every combination of the two switches.
const switchSets: GameSwitches[] = [0, 1, 2, 3].map((bits) => Object.fromEntries(gameSwitches.map((name, index) => [name, Boolean(bits & (1 << index))])) as GameSwitches);

const personalities: Brain[] = ['honest', 'bold', 'paranoid', 'random'];

test('thousands of bot games end with one winner, never stuck, never a card lost', () => {
  const random = createRandom(2026);
  let games = 0;

  for (let seats = 2; seats <= 6; seats++) {
    switchSets.forEach((switches) => {
      for (let game = 0; game < 60; game++) {
        const result = simulateGame(brainsFor(seats, (index) => personalities[(index + game) % personalities.length] ?? 'random'), switches, random);

        expect(Object.keys(brainsFor(seats, () => 'random'))).toContain(result.winner);
        games += 1;
      }
    });
  }

  expect(games).toBe(1200);
});

test('the thinking bot beats the random one', () => {
  const random = createRandom(7);
  const total = 600;
  let wins = 0;

  for (let game = 0; game < total; game++) {
    const thinker = game % 2 === 0 ? 's0' : 's1';
    const result = simulateGame({ s0: thinker === 's0' ? 'honest' : 'random', s1: thinker === 's1' ? 'paranoid' : 'random' }, { whisper: false, doubleCall: false }, random);

    if (result.winner === thinker) wins += 1;
  }

  expect(wins / total).toBeGreaterThan(0.55);
});

// Measured on 2026-10-09: about 4 rounds a game for two, 11 for four, 19 for six; crooks get away
// with over 90% of crooked rounds, since their lies are safe.
test('games last a few rounds per player, and the crook usually gets away', () => {
  const random = createRandom(11);

  for (let seats = 2; seats <= 6; seats += 2) {
    const results = Array.from({ length: 200 }, () => simulateGame(brainsFor(seats, (index) => personalities[index % 3] ?? 'honest'), { whisper: true, doubleCall: true }, random));
    const rounds = results.reduce((sum, result) => sum + result.rounds, 0) / results.length;
    const crooked = results.reduce((sum, result) => sum + result.crooked, 0);
    const survived = results.reduce((sum, result) => sum + result.crookSurvived, 0);

    expect(rounds).toBeGreaterThan(seats);
    expect(rounds).toBeLessThan(seats * 5);
    expect(survived / crooked).toBeGreaterThan(0.8);
  }
});
