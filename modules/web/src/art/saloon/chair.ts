import { cutOut, line, makeCanvas, shape } from '../canvas';
import { paint } from '../palette';

// A saloon chair's back (spec §9.2), standing at each place across the table: two posts, a curved
// top rail and spindles. In the sketches' units, four pixels each.
const scale = 4;

export const chairSize = { width: 110, height: 96 } as const;

export const drawChair = (): HTMLCanvasElement => {
  const { width, height } = chairSize;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);

  ctx.scale(scale, scale);

  for (let x = 30; x <= 80; x += 12.5) {
    line(ctx, `M${x},26 V${height - 4}`, paint.ink, 6);
    line(ctx, `M${x},26 V${height - 4}`, paint.plankLight, 3);
  }

  shape(ctx, `M6,${height - 2} V24 H18 V${height - 2} Z M${width - 18},${height - 2} V24 H${width - 6} V${height - 2} Z`, paint.plank, paint.ink, 3);
  shape(ctx, `M2,26 C20,4 90,4 108,26 C104,34 92,30 55,28 C18,30 6,34 2,26 Z`, paint.plankLight, paint.ink, 3);
  line(ctx, 'M18,18 C40,10 70,10 92,18', 'rgba(0, 0, 0, 0.25)', 2);

  return cutOut(canvas, { border: 8 });
};
