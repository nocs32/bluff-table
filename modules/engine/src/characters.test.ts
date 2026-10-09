import { describe, expect, it } from 'vitest';
import { rollCharacter } from './characters.js';
import { createRandom } from './random.js';

describe('rollCharacter', () => {
  it('never stacks a scar and a straw', () => {
    const random = createRandom(3);

    for (let roll = 0; roll < 2000; roll++) {
      const character = rollCharacter(random);

      expect(character.scar !== 'none' && character.straw).toBe(false);
    }
  });

  it('comes up with every hat in time', () => {
    const random = createRandom(9);
    const hats = new Set(Array.from({ length: 400 }, () => rollCharacter(random).hat));

    expect(hats.size).toBe(6);
  });
});
