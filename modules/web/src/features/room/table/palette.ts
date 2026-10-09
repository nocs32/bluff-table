import { Color } from 'three';
import { figurePaint, paint } from '../../../art/palette';

// Colours brighter than white, for things that glow: the bloom only picks those up (spec §10.2).
const glowing = (colour: string, strength: number): Color => new Color(colour).multiplyScalar(strength);

export const glow = {
  flame: glowing(paint.flame, 5),
  // The fuse's spark (spec D14).
  spark: glowing(paint.flame, 4),
};

// The stage's own colours, for what isn't drawn on a canvas.
export const furniture = {
  ink: new Color(paint.ink),
  night: new Color(paint.night),
  rope: new Color(figurePaint.rope),
  warm: new Color(paint.warm),
};
