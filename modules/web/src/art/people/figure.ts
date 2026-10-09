import type { Character, Mood, PlayerColor } from '@bluff-table/protocol';
import { coatPaint, figurePaint, hairPaint, paint, playerPaint } from '../palette';

// One person as the art draws them (spec §8.3): their character and colour, where they look, the
// face they pull, and what else is going on.
export interface Figure {
  character: Character;
  color: PlayerColor;
  // -1 to 1 each way, right and up positive: the face slides across the head the cartoon way.
  look?: { x: number; y: number };
  mood?: Mood;
  ghost?: boolean;
  // A black shape against the flash of a bang.
  silhouette?: boolean;
  // Holding the revolver to their head.
  gun?: boolean;
  // How many cards they hold, as a fan of backs.
  cards?: number;
  // Only the body or only the head, so the table can stand between them, and heads move alone.
  part?: 'body' | 'head';
  // The barkeep wears an apron over his shirt instead of a coat.
  apron?: boolean;
}

// The colours one figure is drawn in.
export interface FigurePaint {
  ink: string;
  card: string;
  coat: string;
  hat: string;
  band: string;
  hair: string;
  scar: string;
  shirt: string;
  skin: string;
  back: string;
  steel: string;
  cylinder: string;
  grip: string;
  rope: string;
  straw: string;
}

// Which colour is the player's on each hat: the band on stetsons and fedoras, the whole hat on the
// rest. The cowboy hat keeps its rope band.
const hatColours = (figure: Figure): { hat: string; band: string } => {
  const colour = playerPaint[figure.color];

  switch (figure.character.hat) {
    case 'stetson':
      return { hat: figurePaint.stetson, band: colour };
    case 'fedora':
      return { hat: figurePaint.fedora, band: colour };
    case 'cowboy':
      return { hat: colour, band: figurePaint.rope };
    default:
      return { hat: colour, band: colour };
  }
};

const silhouettePaint = (): FigurePaint => {
  const ink = paint.ink;

  return { ink, card: ink, coat: ink, hat: ink, band: ink, hair: ink, scar: ink, shirt: ink, skin: ink, back: ink, steel: ink, cylinder: ink, grip: ink, rope: ink, straw: ink };
};

const ghostPaint = (): FigurePaint => {
  const { ghost, ghostInk, ghostLight, ghostMid } = figurePaint;

  return { ink: ghostInk, card: ghostLight, coat: ghost, hat: ghost, band: ghostMid, hair: ghostMid, scar: ghostMid, shirt: ghostLight, skin: ghostLight, back: ghostMid, steel: ghost, cylinder: ghost, grip: ghost, rope: ghostMid, straw: ghostMid };
};

export const figureColours = (figure: Figure): FigurePaint => {
  if (figure.silhouette) return silhouettePaint();

  if (figure.ghost) return ghostPaint();

  const { hat, band } = hatColours(figure);

  return {
    ink: paint.ink,
    card: paint.card,
    coat: figure.apron ? figurePaint.apron : coatPaint[figure.character.coat],
    hat,
    band,
    hair: hairPaint[figure.character.hairTone],
    scar: figurePaint.scar,
    shirt: figurePaint.shirt,
    skin: paint.card,
    back: figurePaint.back,
    steel: paint.steel,
    cylinder: paint.cylinder,
    grip: paint.grip,
    rope: figurePaint.rope,
    straw: figurePaint.straw,
  };
};
