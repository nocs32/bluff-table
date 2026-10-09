import { characterCoats, characterHairTones, playerColors, type CharacterCoat, type CharacterHairTone, type PlayerColor } from '@bluff-table/protocol';
import { token } from 'styled-system/tokens';

// The art's colours come from the design system, so the scene and the HTML match (spec §8.6).

export const paint = {
  ink: token('colors.paper.ink'),
  card: token('colors.paper.card'),
  bright: token('colors.paper.bright'),
  poster: token('colors.paper.poster'),
  stain: token('colors.paper.stain'),
  line: token('colors.paper.line'),
  muted: token('colors.paper.muted'),
  brass: token('colors.brass.base'),
  brassDeep: token('colors.brass.deep'),
  brassLight: token('colors.brass.light'),
  rust: token('colors.rust.base'),
  rustDeep: token('colors.rust.deep'),
  rustHot: token('colors.rust.hot'),
  redInk: token('colors.rust.ink'),
  feltDark: token('colors.felt.dark'),
  feltDeep: token('colors.felt.deep'),
  felt: token('colors.felt.base'),
  feltLight: token('colors.felt.light'),
  plankDark: token('colors.plank.dark'),
  plank: token('colors.plank.base'),
  plankLight: token('colors.plank.light'),
  door: token('colors.plank.door'),
  groove: token('colors.plank.groove'),
  night: token('colors.night.deep'),
  nightBase: token('colors.night.base'),
  flame: token('colors.lamp.flame'),
  glow: token('colors.lamp.glow'),
  warm: token('colors.lamp.warm'),
  steel: token('colors.steel.base'),
  cylinder: token('colors.steel.cylinder'),
  chamber: token('colors.steel.chamber'),
  hole: token('colors.steel.hole'),
  grip: token('colors.steel.grip'),
  sky: token('colors.sky.night'),
  moon: token('colors.sky.moon'),
};

// A person's own details (spec §8.3).
export const figurePaint = {
  shirt: token('colors.figure.shirt'),
  stetson: token('colors.figure.stetson'),
  fedora: token('colors.figure.fedora'),
  rope: token('colors.figure.rope'),
  straw: token('colors.figure.straw'),
  scar: token('colors.figure.scar'),
  sweat: token('colors.figure.sweat'),
  tongue: token('colors.figure.tongue'),
  pale: token('colors.figure.pale'),
  apron: token('colors.figure.apron'),
  back: token('colors.figure.back'),
  ghostInk: token('colors.ghost.ink'),
  ghostLight: token('colors.ghost.light'),
  ghost: token('colors.ghost.base'),
  ghostMid: token('colors.ghost.mid'),
};

export const bottlePaint = [token('colors.bottle.green'), token('colors.bottle.amber'), token('colors.bottle.blue'), token('colors.bottle.honey'), token('colors.bottle.wine')];

const byName = <K extends string>(names: readonly K[], group: string): Record<K, string> =>
  Object.fromEntries(names.map((name) => [name, token(`colors.${group}.${name}` as Parameters<typeof token>[0])])) as Record<K, string>;

// Each seat's colour, dyed into a hat or its band.
export const playerPaint: Record<PlayerColor, string> = byName(playerColors, 'player');

export const coatPaint: Record<CharacterCoat, string> = byName(characterCoats, 'coat');

export const hairPaint: Record<CharacterHairTone, string> = byName(characterHairTones, 'hair');

// Lettering in the art uses the page's typefaces.
export const artFonts = {
  display: token('fonts.display'),
  body: token('fonts.body'),
};
