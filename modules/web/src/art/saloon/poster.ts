import { at, box, circle, cutOut, fitFont, line, makeCanvas, text } from '../canvas';
import { paint } from '../palette';
import { drawPerson, type Figure } from '../people';

// A wanted poster on the saloon's wall (spec D16, §8.2): a player's face and tonight's bounty on
// their head. In the sketches' units, four pixels each.
const scale = 4;

export const posterSize = { width: 100, height: 132 } as const;

export interface PosterText {
  // "WANTED", in the reader's language.
  wanted: string;
  name: string;
  // The reward line, e.g. "$300".
  reward: string;
}

// Aged paper: darker towards the edges.
const paper = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  const stain = ctx.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, height * 0.75);

  stain.addColorStop(0, paint.poster);
  stain.addColorStop(1, paint.stain);
  ctx.fillStyle = stain;
  ctx.fillRect(2, 2, width - 4, height - 4);
  ctx.strokeStyle = paint.ink;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(2, 2, width - 4, height - 4);
};

const portrait = (ctx: CanvasRenderingContext2D, figure: Figure, x: number, y: number, size: number): void => {
  box(ctx, x, y, size, size, 1, paint.stain, paint.ink, 1.5);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();
  at(ctx, { x: x + size / 2 - 70 * (size / 100), y: y + size / 2 - 74 * (size / 100), scale: size / 100 }, () => drawPerson(ctx, { ...figure, part: 'head' }));
  ctx.restore();
};

export const drawPoster = (figure: Figure, words: PosterText): HTMLCanvasElement => {
  const { width, height } = posterSize;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);
  const inner = width - 20;

  ctx.scale(scale, scale);
  paper(ctx, width, height);
  fitFont(ctx, words.wanted, inner, 19);
  text(ctx, words.wanted, width / 2, 17, paint.ink);
  line(ctx, `M10,29 H${width - 10} M10,32 H${width - 10}`, paint.ink, 1);
  portrait(ctx, figure, 18, 36, 64);
  fitFont(ctx, words.name, inner, 12);
  text(ctx, words.name, width / 2, 110, paint.ink);
  fitFont(ctx, words.reward, inner, 13);
  text(ctx, words.reward, width / 2, 123, paint.rustDeep);
  [10, width - 10].forEach((x) => circle(ctx, x, 9, 2.6, paint.brass, paint.ink, 1.2));

  return cutOut(canvas, { border: 8, shadow: 14 });
};
