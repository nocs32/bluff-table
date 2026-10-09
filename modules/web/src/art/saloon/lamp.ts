import { circle, cutOut, line, makeCanvas, oval, shape } from '../canvas';
import { paint } from '../palette';

// The oil lamp over the table (spec §8.1, §8.2): a hurricane lantern hanging by its wire handle, a
// vented brass cap, a glass globe in a wire guard round the flame, and the brass tank of oil under
// it. In the sketches' units, four pixels each. The flame itself is drawn bright by the stage, so
// it glows.
const scale = 4;

export const lampSize = { width: 110, height: 150 } as const;

// Where the flame burns, as a share of the drawing's width and height, for the stage's glow.
export const lampFlame = { x: 0.5, y: 0.59 } as const;

const cx = lampSize.width / 2;

const handle = (ctx: CanvasRenderingContext2D): void => {
  circle(ctx, cx, 7, 5, 'none', paint.ink, 3);
  line(ctx, `M${cx - 30},62 C${cx - 34},20 ${cx + 34},20 ${cx + 30},62`, paint.ink, 4.5);
  line(ctx, `M${cx - 30},62 C${cx - 34},20 ${cx + 34},20 ${cx + 30},62`, paint.steel, 2);
  line(ctx, `M${cx},12 V22`, paint.ink, 2.5);
};

const cap = (ctx: CanvasRenderingContext2D): void => {
  shape(ctx, `M${cx - 8},34 H${cx + 8} V42 H${cx - 8} Z`, paint.brassDeep, paint.ink, 2);
  shape(ctx, `M${cx - 24},58 C${cx - 24},44 ${cx - 12},40 ${cx},40 C${cx + 12},40 ${cx + 24},44 ${cx + 24},58 Z`, paint.brass, paint.ink, 2.5);
  line(ctx, `M${cx - 14},48 v6 M${cx - 5},45 v8 M${cx + 5},45 v8 M${cx + 14},48 v6`, paint.ink, 1.6);
  oval(ctx, cx - 12, 47, 3, 5, 'rgba(255, 255, 255, 0.4)');
};

const globe = (ctx: CanvasRenderingContext2D): void => {
  const outline = `M${cx - 16},60 C${cx - 32},70 ${cx - 32},104 ${cx - 16},114 H${cx + 16} C${cx + 32},104 ${cx + 32},70 ${cx + 16},60 Z`;

  shape(ctx, outline, 'rgba(255, 233, 168, 0.42)', paint.ink, 2.5);
  shape(ctx, `M${cx},74 C${cx - 7},84 ${cx - 7},96 ${cx},100 C${cx + 7},96 ${cx + 7},84 ${cx},74 Z`, paint.flame, paint.warm, 1.5);
  line(ctx, `M${cx - 22},74 q-4,14 0,28`, 'rgba(255, 255, 255, 0.8)', 2.5);
  // The wire guard round the globe.
  line(ctx, `M${cx - 30},62 C${cx - 38},76 ${cx - 38},100 ${cx - 28},114 M${cx + 30},62 C${cx + 38},76 ${cx + 38},100 ${cx + 28},114 M${cx - 33},87 H${cx + 33}`, paint.ink, 2);
};

const tank = (ctx: CanvasRenderingContext2D): void => {
  shape(ctx, `M${cx - 34},122 C${cx - 34},112 ${cx + 34},112 ${cx + 34},122 C${cx + 34},134 ${cx + 20},140 ${cx},140 C${cx - 20},140 ${cx - 34},134 ${cx - 34},122 Z`, paint.brass, paint.ink, 3);
  line(ctx, `M${cx - 33},121 H${cx + 33}`, paint.brassDeep, 2);
  oval(ctx, cx - 18, 127, 7, 3, 'rgba(255, 255, 255, 0.35)');
  // The knob that turns the wick up.
  line(ctx, `M${cx + 20},116 L${cx + 30},110`, paint.ink, 2.5);
  circle(ctx, cx + 32, 109, 4, paint.brassDeep, paint.ink, 2);
  shape(ctx, `M${cx - 10},139 H${cx + 10} L${cx + 6},146 H${cx - 6} Z`, paint.brassDeep, paint.ink, 2);
};

export const drawLamp = (): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(lampSize.width * scale, lampSize.height * scale);

  ctx.scale(scale, scale);
  handle(ctx);
  globe(ctx);
  cap(ctx);
  tank(ctx);

  return cutOut(canvas, { border: 7 });
};
