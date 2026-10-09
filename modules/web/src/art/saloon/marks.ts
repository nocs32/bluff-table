import { box, circle, cutOut, line, makeCanvas, shape } from '../canvas';
import { paint } from '../palette';

// The little things at a player's place (spec §5.8, §5.9, §8.2). In the sketches' units, four
// pixels each.
const scale = 4;

// The barkeep's whisper: a speech bubble with a hush in it, over the whispered player's tag.
export const drawWhisperMark = (): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(56 * scale, 44 * scale);

  ctx.scale(scale, scale);
  shape(ctx, 'M8,4 H48 Q52,4 52,8 V26 Q52,30 48,30 H24 L14,40 L16,30 H8 Q4,30 4,26 V8 Q4,4 8,4 Z', paint.card, paint.ink, 2.5);
  [18, 28, 38].forEach((x) => circle(ctx, x, 17, 3, paint.ink));

  return cutOut(canvas, { border: 5 });
};

// A whiskey shot: the double call still to make (spec §5.9).
export const drawShot = (): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(28 * scale, 36 * scale);

  ctx.scale(scale, scale);
  shape(ctx, 'M4,4 H24 L21,32 H7 Z', 'rgba(220, 235, 240, 0.55)', paint.ink, 2.2);
  shape(ctx, 'M5.6,12 H22.4 L20.4,30 H7.6 Z', paint.brassDeep);
  line(ctx, 'M5.6,12 H22.4', paint.brass, 1.6);
  line(ctx, 'M8,7 L9.5,28', 'rgba(255, 255, 255, 0.7)', 1.6);
  box(ctx, 6, 30, 16, 3, 1, 'rgba(43, 33, 24, 0.25)');

  return cutOut(canvas, { border: 5 });
};
