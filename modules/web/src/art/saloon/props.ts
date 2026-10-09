import { at, box, cutOut, fitFont, makeCanvas, shape, text } from '../canvas';
import { paint } from '../palette';
import { backPaint, cardBack } from '../people';

// The little printed things in the saloon: name tags at each place, the switches' tent cards on the
// bar, and what lies on the table. In the sketches' units, four pixels each.
const scale = 4;

// A place's name tag (spec §8.2): card stock with a band in the player's colour.
export const drawNameTag = (name: string, colour: string): HTMLCanvasElement => {
  const width = 96;
  const height = 30;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);

  ctx.scale(scale, scale);
  box(ctx, 2, 2, width - 4, height - 4, 4, paint.card, paint.ink, 2.5);
  box(ctx, 2, 2, 12, height - 4, [4, 0, 0, 4], colour, paint.ink, 2.5);
  fitFont(ctx, name, width - 28, 15);
  text(ctx, name, (width + 14) / 2, height / 2 + 1, paint.ink);

  return cutOut(canvas, { border: 6 });
};

export const tentSize = { width: 120, height: 46 } as const;

// A switch's tent card on the bar (spec §5.10): card stock with a double rule and the switch's name.
export const drawTentCard = (name: string): HTMLCanvasElement => {
  const { width, height } = tentSize;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);

  ctx.scale(scale, scale);
  box(ctx, 2, 2, width - 4, height - 4, 2, paint.card, paint.ink, 2.5);
  box(ctx, 6, 6, width - 12, height - 12, 1, 'none', paint.ink, 1);
  shape(ctx, `M14,${height / 2} l3,-5 l3,5 l-3,5 Z M${width - 20},${height / 2} l3,-5 l3,5 l-3,5 Z`, paint.rust);
  fitFont(ctx, name, width - 44, 15);
  text(ctx, name, width / 2, height / 2 + 1, paint.ink);

  return cutOut(canvas, { border: 6 });
};

// The deck, squared up on the felt, waiting for the deal.
export const drawDeck = (): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(40 * scale * 2, 52 * scale * 2);

  ctx.scale(scale * 2, scale * 2);

  for (let card = 4; card >= 0; card--) at(ctx, { x: 18 + card * 0.8, y: 26 + card * 1.2 }, () => cardBack(ctx, backPaint));

  return cutOut(canvas, { border: 8 });
};
