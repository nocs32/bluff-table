import { cutOut, line, makeCanvas, shape } from '../canvas';
import { paint } from '../palette';

// A turned wooden table leg (spec §8.2): a block at the top, a bulb, rings, a taper and a foot. In
// the sketches' units, four pixels each.
const scale = 4;

export const legSize = { width: 30, height: 150 } as const;

export const drawTableLeg = (): HTMLCanvasElement => {
  const { width, height } = legSize;
  const cx = width / 2;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);
  const outline = `M${cx - 9},2 H${cx + 9} V24 L${cx + 6},28 C${cx + 14},40 ${cx + 14},58 ${cx + 6},66 L${cx + 9},70 L${cx + 6},74 L${cx + 4},128 L${cx + 9},138 L${cx + 8},${height - 2} H${cx - 8} L${cx - 9},138 L${cx - 4},128 L${cx - 6},74 L${cx - 9},70 L${cx - 6},66 C${cx - 14},58 ${cx - 14},40 ${cx - 6},28 L${cx - 9},24 Z`;

  ctx.scale(scale, scale);
  shape(ctx, outline, paint.plankLight, paint.ink, 2.5);
  line(ctx, `M${cx - 9},24 H${cx + 9} M${cx - 6},66 H${cx + 6} M${cx - 6},74 H${cx + 6} M${cx - 6},128 H${cx + 6}`, paint.ink, 1.5);
  line(ctx, `M${cx - 4},34 C${cx - 8},44 ${cx - 8},52 ${cx - 4},60 M${cx - 2},80 L${cx - 1},124`, 'rgba(255, 255, 255, 0.28)', 2);

  return cutOut(canvas, { border: 6 });
};

// The table's shadow on the floor: dark in the middle, soft at the edge.
export const drawFloorShadow = (): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(512, 512);
  const gradient = ctx.createRadialGradient(256, 256, 60, 256, 256, 256);

  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.55)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  return canvas;
};
