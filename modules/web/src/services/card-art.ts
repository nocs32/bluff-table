import { drawCardBack, drawCardFace, drawCylinder } from '../art';
import type { CardArtService } from './types';

// Each card's picture is drawn once and kept: there are only five, and seven cylinders.
export const createCardArt = (): CardArtService => {
  const drawn = new Map<string, string>();

  const keep = (key: string, draw: () => HTMLCanvasElement): string => {
    const known = drawn.get(key);

    if (known) return known;

    const url = draw().toDataURL('image/png');

    drawn.set(key, url);

    return url;
  };

  return {
    face: (rank) => keep(rank, () => drawCardFace(rank)),
    back: () => keep('back', drawCardBack),
    cylinder: (left) => keep(`cylinder${left}`, () => drawCylinder(left)),
  };
};
