import { box, circle, cutOut, line, makeCanvas, shape } from '../canvas';
import { bottlePaint, paint } from '../palette';

// The bar at the back of the saloon (spec §8.2): the shelves of bottles on the wall behind it, and
// the counter the barkeep stands at. Drawn in the sketches' units, four pixels each.
const scale = 4;

const bottle = (ctx: CanvasRenderingContext2D, x: number, y: number, height: number, tint: string): void => {
  shape(ctx, `M${x},${y} v${-height + 14} q0,-6 6,-8 v-6 h6 v6 q6,2 6,8 v${height - 14} Z`, tint, paint.ink, 2);
  ctx.fillStyle = paint.card;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(x + 3, y - height / 2, 12, 9);
  ctx.globalAlpha = 1;
};

const glass = (ctx: CanvasRenderingContext2D, x: number, y: number): void => {
  shape(ctx, `M${x},${y - 16} h14 l-2,16 h-10 Z`, 'rgba(243, 230, 200, 0.35)', paint.ink, 1.8);
  line(ctx, `M${x + 3},${y - 13} l1,10`, 'rgba(255, 255, 255, 0.7)', 1.5);
};

// One shelf: a board with bottles of every height and a few glasses at the end.
const shelf = (ctx: CanvasRenderingContext2D, y: number, width: number, seed: number): void => {
  const count = Math.floor((width - 70) / 25);

  for (let index = 0; index < count; index++) {
    bottle(ctx, 14 + index * 25, y, 34 + ((index * 7 + seed) % 15), bottlePaint[(index + seed) % bottlePaint.length] ?? paint.brass);
  }

  for (let index = 0; index < 3; index++) glass(ctx, width - 62 + index * 18, y);

  box(ctx, 4, y, width - 8, 8, 1, paint.plankLight, paint.ink, 2.5);
};

// The shelves behind the bar, cut out of card and pinned to the wall.
export const drawBackBar = (): HTMLCanvasElement => {
  const width = 300;
  const height = 120;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);

  ctx.scale(scale, scale);
  box(ctx, 2, 2, width - 4, height - 4, 3, paint.plankDark, paint.ink, 3);
  shelf(ctx, 52, width, 0);
  shelf(ctx, 106, width, 3);

  return cutOut(canvas, { border: 12, shadow: 16 });
};

// The counter: a thick top, panelled front and a brass foot rail.
export const drawCounter = (): HTMLCanvasElement => {
  const width = 330;
  const height = 74;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);

  ctx.scale(scale, scale);
  box(ctx, 8, 12, width - 16, height - 16, 2, paint.plank, paint.ink, 3);

  for (let x = 18; x < width - 40; x += 52) box(ctx, x, 22, 44, 30, 2, paint.plankDark, paint.ink, 2);

  box(ctx, 2, 2, width - 4, 12, 3, paint.plankLight, paint.ink, 3);
  line(ctx, `M16,${height - 10} H${width - 16}`, paint.ink, 6);
  line(ctx, `M16,${height - 10} H${width - 16}`, paint.brass, 3);

  return cutOut(canvas, { border: 10 });
};

// What the barkeep polishes: a tumbler, its bottom wrapped in a cloth, held in both hands.
export const drawPolishing = (): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(48 * scale, 44 * scale);

  ctx.scale(scale, scale);
  shape(ctx, 'M13,4 H35 L32,34 H16 Z', 'rgba(150, 190, 205, 0.85)', paint.ink, 2.2);
  ctx.beginPath();
  ctx.ellipse(24, 4, 11, 2.5, 0, 0, Math.PI * 2);
  ctx.strokeStyle = paint.ink;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  line(ctx, 'M17,8 l2,18', 'rgba(255, 255, 255, 0.85)', 2);
  shape(ctx, 'M8,24 C14,20 34,20 40,24 L42,38 C34,42 14,42 6,38 Z', paint.bright, paint.ink, 2);
  line(ctx, 'M14,26 l-1,12 M24,25 v14 M34,26 l1,12', 'rgba(43, 33, 24, 0.35)', 1.2);
  circle(ctx, 7, 32, 6, paint.card, paint.ink, 2);
  circle(ctx, 41, 32, 6, paint.card, paint.ink, 2);

  return cutOut(canvas, { border: 6 });
};
