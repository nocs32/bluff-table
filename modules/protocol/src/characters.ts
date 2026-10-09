import * as v from 'valibot';

// The people at the table are ink cut-out busts (spec D7, §8.3), built from these parts. Each
// person starts as a random character and can change it in the lobby. One hat, one kind of facial
// hair, at most one thin scar: presets and random rolls never stack quirks.

export const characterHats = ['stetson', 'cowboy', 'bowler', 'fedora', 'flatcap', 'none'] as const;

// Facial hair: the full beard, the walrus, the goatee and the handlebar (worn with stubble) are one
// kind each.
export const characterFaces = ['clean', 'stubble', 'handlebar', 'walrus', 'beard', 'goatee'] as const;

export const characterHairs = ['short', 'long', 'bald'] as const;

// A thin line through a brow, or on a cheek.
export const characterScars = ['none', 'brow', 'cheek'] as const;

export const characterHairTones = ['chestnut', 'auburn', 'brown', 'black', 'grey'] as const;

export const characterCoats = ['tan', 'moss', 'navy', 'slate', 'wine', 'umber'] as const;

export type CharacterHat = (typeof characterHats)[number];
export type CharacterFace = (typeof characterFaces)[number];
export type CharacterHair = (typeof characterHairs)[number];
export type CharacterScar = (typeof characterScars)[number];
export type CharacterHairTone = (typeof characterHairTones)[number];
export type CharacterCoat = (typeof characterCoats)[number];

export interface Character {
  hat: CharacterHat;
  face: CharacterFace;
  hair: CharacterHair;
  scar: CharacterScar;
  // Chewing a straw (the user's own request, spec D7).
  straw: boolean;
  hairTone: CharacterHairTone;
  coat: CharacterCoat;
}

export const characterSchema = v.strictObject({
  hat: v.picklist(characterHats),
  face: v.picklist(characterFaces),
  hair: v.picklist(characterHairs),
  scar: v.picklist(characterScars),
  straw: v.boolean(),
  hairTone: v.picklist(characterHairTones),
  coat: v.picklist(characterCoats),
});

// The faces a head can pull (spec §7.2): the game's own, set by what happens. The face wheel's
// come with the rounds.
export const moods = ['idle', 'suspicious', 'smirk', 'sweat', 'pull', 'phew', 'dead'] as const;

export type Mood = (typeof moods)[number];
