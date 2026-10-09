import { renderPortrait } from '../art';
import type { PortraitService } from './types';

// Pixels across: sharp at the biggest chip on a high-density screen.
const size = 112;

// Faces are drawn once per look and kept: a table has at most six people, and each changes their
// character a few times at most.
export const createPortraits = (): PortraitService => {
  const drawn = new Map<string, string>();

  return {
    portrait: (character, color) => {
      const key = `${JSON.stringify(character)}|${color}`;
      const known = drawn.get(key);

      if (known) return known;

      const url = renderPortrait({ character, color }, size).toDataURL('image/png');

      drawn.set(key, url);

      return url;
    },
  };
};
