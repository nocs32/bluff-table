import {
  characterCoats,
  characterFaces,
  characterHairs,
  characterHairTones,
  characterHats,
  type Character,
} from '@bluff-table/protocol';

const pick = <T>(items: readonly T[], random: () => number): T => items[Math.floor(random() * items.length)] as T;

// How often a roll gets each quirk. A roll never gets both (spec D7: stacked quirks were "too much").
const scarChance = 0.22;
const strawChance = 0.14;

// Hats come up a little more often than no hat, and short hair more than long or none: a saloon
// of cowboys, not a barber's.
const hatPool = [...characterHats.filter((hat) => hat !== 'none'), 'stetson', 'cowboy', 'none'] as const;
const hairPool = ['short', 'short', ...characterHairs] as const;

// A random character for someone who just sat down, or for "Roll a random one" (spec §8.3):
// one hat, one kind of facial hair, and at most one quirk, a thin scar or a straw.
export const rollCharacter = (random: () => number): Character => {
  const quirk = random();

  return {
    hat: pick(hatPool, random),
    face: pick(characterFaces, random),
    hair: pick(hairPool, random),
    scar: quirk < scarChance ? pick(['brow', 'cheek'] as const, random) : 'none',
    straw: quirk >= scarChance && quirk < scarChance + strawChance,
    hairTone: pick(characterHairTones, random),
    coat: pick(characterCoats, random),
  };
};
