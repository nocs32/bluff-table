import { Color } from 'three';
import { paint } from '../../../art/palette';

// Colours brighter than white, for things that glow: the bloom only picks those up (spec §10.2).
const glowing = (colour: string, strength: number): Color => new Color(colour).multiplyScalar(strength);

export const glow = {
  flame: glowing(paint.flame, 5),
};

// The stage's own colours, for what isn't drawn on a canvas.
export const furniture = {
  ink: new Color(paint.ink),
  night: new Color(paint.night),
};
