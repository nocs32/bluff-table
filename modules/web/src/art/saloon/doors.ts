import { createRandom } from '@bluff-table/engine';
import { box, circle, cutOut, line, makeCanvas, shape } from '../canvas';
import { paint } from '../palette';

// The swinging doors (spec §8.2): a doorway onto the night, and two batwing leaves that swing open
// when someone joins. In the sketches' units, four pixels each.
const scale = 4;

const night = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  const random = createRandom(5);

  ctx.fillStyle = paint.sky;
  ctx.fillRect(18, 18, width - 36, height - 18);

  for (let star = 0; star < 26; star++) circle(ctx, 22 + random() * (width - 44), 22 + random() * (height * 0.55), random() < 0.2 ? 1.6 : 0.9, paint.moon);

  circle(ctx, width * 0.66, 52, 13, paint.moon, paint.ink, 2);
  circle(ctx, width * 0.66 + 5, 48, 3, 'rgba(43, 33, 24, 0.18)');
  // The desert, and a cactus far off.
  shape(ctx, `M18,${height - 46} C60,${height - 58} 100,${height - 40} ${width - 18},${height - 52} V${height} H18 Z`, paint.night, paint.ink, 2);
  shape(ctx, `M${width * 0.3},${height - 52} v-30 q0,-6 5,-6 q5,0 5,6 v30 Z M${width * 0.3},${height - 66} h-8 v-10 q0,-4 4,-4 q4,0 4,4 Z`, paint.night, paint.ink, 2);
};

// The doorway: a heavy frame round the night outside.
export const drawDoorway = (): HTMLCanvasElement => {
  const width = 120;
  const height = 200;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);

  ctx.scale(scale, scale);
  night(ctx, width, height);
  shape(ctx, `M2,${height} V2 H${width - 2} V${height} H${width - 18} V18 H18 V${height} Z`, paint.door, paint.ink, 3);
  line(ctx, `M10,${height} V10 H${width - 10} V${height}`, paint.ink, 1.5);

  return cutOut(canvas, { border: 10, shadow: 14 });
};

// One batwing leaf: a scalloped top and louvres. The left leaf; the right one is its mirror image.
export const drawDoorLeaf = (): HTMLCanvasElement => {
  const width = 44;
  const height = 74;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);

  ctx.scale(scale, scale);
  shape(ctx, `M2,14 Q${width / 2},0 ${width - 2},10 V${height - 2} H2 Z`, paint.door, paint.ink, 2.5);

  for (let y = 22; y < height - 10; y += 7) line(ctx, `M8,${y} H${width - 8}`, paint.plankDark, 3);

  box(ctx, 6, 18, width - 12, height - 26, 2, 'none', paint.ink, 1.5);

  return cutOut(canvas, { border: 8 });
};
