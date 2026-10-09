import { at, box, circle, line, shape } from '../canvas';
import { figurePaint, paint } from '../palette';
import type { FigurePaint } from './figure';

// The things people hold, from the look sketches (spec §8.7).

export interface PropPaint {
  ink: string;
  steel: string;
  cylinder: string;
  grip: string;
}

export const steelPaint: PropPaint = { ink: paint.ink, steel: paint.steel, cylinder: paint.cylinder, grip: paint.grip };

// A six-shooter lying flat, muzzle at (0, 0), pointing left.
export const revolver = (ctx: CanvasRenderingContext2D, c: PropPaint): void => {
  box(ctx, 0, -3, 16, 6, 1, c.steel, c.ink, 2.5);
  box(ctx, 15, -6, 11, 12, 2, c.cylinder, c.ink, 2.5);
  line(ctx, 'M15,0 H26 M3,-3 v-2.5', c.ink, 1.5);
  shape(ctx, 'M26,-4 L31,-9 L34,-6 L28,-1 Z', c.steel, c.ink, 2);
  shape(ctx, 'M24,5 L30,5 L35,23 L27,25 Z', c.grip, c.ink, 2.5);
  line(ctx, 'M18,6 q2,7 7,6', c.ink, 2);
};

// The arm bringing the revolver up to the temple, for a head at (hx, hy).
export const gunHand = (ctx: CanvasRenderingContext2D, c: FigurePaint, hx: number, hy: number): void => {
  const ax = hx + 33;
  const ay = hy - 9;
  const sleeve = `M124,172 Q${ax + 52},${ay + 66} ${ax + 37},${ay + 22}`;

  line(ctx, sleeve, c.ink, 17);
  line(ctx, sleeve, c.coat, 12);
  at(ctx, { x: ax, y: ay, scale: 1.25 }, () => revolver(ctx, c));
  circle(ctx, ax + 37, ay + 19, 6.5, c.skin, c.ink, 2.5);
};

export interface BackPaint {
  ink: string;
  card: string;
  back: string;
}

export const backPaint: BackPaint = { ink: paint.ink, card: paint.card, back: figurePaint.back };

// A card's back, centred on (0, 0).
export const cardBack = (ctx: CanvasRenderingContext2D, c: BackPaint, w = 30, h = 42): void => {
  box(ctx, -w / 2, -h / 2, w, h, 3, c.back, c.ink, 2);
  box(ctx, -w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 2, 'none', c.card, 1.2);
};

// A hand of cards held as a fan of backs in front of the chest, and the two hands holding it.
export const fan = (ctx: CanvasRenderingContext2D, c: FigurePaint, count: number): void => {
  for (let card = 0; card < count; card++) {
    ctx.save();
    ctx.translate(70, 190);
    ctx.rotate((((card - (count - 1) / 2) * 9) * Math.PI) / 180);
    ctx.translate(-70, -190);
    at(ctx, { x: 70, y: 141 }, () => cardBack(ctx, c, 18, 26));
    ctx.restore();
  }

  circle(ctx, 58, 154, 6, c.skin, c.ink, 2.5);
  circle(ctx, 82, 154, 6, c.skin, c.ink, 2.5);
};
