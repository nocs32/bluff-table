import { gameLimits } from '@bluff-table/protocol';
import { circle, cutOut, line, makeCanvas } from '../canvas';
import { paint } from '../palette';

// A revolver's cylinder seen end on (spec §5.6, §8.2): six chambers round the pin. The ones still
// to pull are brass (one of them holds the bullet, nobody knows which); the ones already pulled are
// empty black holes. It's printed on each name tag, and yours lies on the felt by your gun.

const chamber = (ctx: CanvasRenderingContext2D, centre: { x: number; y: number; r: number }, index: number, live: boolean): void => {
  const { r } = centre;
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / gameLimits.chambers;
  const x = centre.x + Math.cos(angle) * r * 0.57;
  const y = centre.y + Math.sin(angle) * r * 0.57;

  if (!live) {
    circle(ctx, x, y, r * 0.25, paint.hole, paint.ink, r * 0.06);

    return;
  }

  circle(ctx, x, y, r * 0.25, paint.brass, paint.ink, r * 0.06);
  circle(ctx, x, y, r * 0.15, 'none', paint.brassDeep, r * 0.05);
  circle(ctx, x - r * 0.07, y - r * 0.07, r * 0.06, 'rgba(255, 255, 255, 0.55)');
};

// The cylinder round (x, y), `r` across its middle, with `left` chambers still to pull, counted
// clockwise from the top.
export const cylinderFace = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, left: number): void => {
  const glint = r * 0.68;

  circle(ctx, x, y, r, paint.cylinder, paint.ink, r * 0.09);
  line(ctx, `M${x - glint},${y - glint} A${r * 0.96},${r * 0.96} 0 0 1 ${x + glint},${y - glint}`, 'rgba(255, 255, 255, 0.35)', r * 0.06);

  for (let index = 0; index < gameLimits.chambers; index++) chamber(ctx, { x, y, r }, index, index < left);

  circle(ctx, x, y, r * 0.16, paint.steel, paint.ink, r * 0.06);
};

// Your cylinder, on its own, lying on the felt.
export const drawCylinder = (left: number): HTMLCanvasElement => {
  const size = 512;
  const { canvas, ctx } = makeCanvas(size, size);

  cylinderFace(ctx, size / 2, size / 2, size / 2 - 12, left);

  return cutOut(canvas, { border: 12 });
};
