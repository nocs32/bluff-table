import { circle, line, shape } from '../canvas';
import { figurePaint, paint } from '../palette';

// Each rank's picture, centred on (0, 0) in the sketches' units, so a card reads without its letter
// (spec §8.6: no language on the cards): a crown for Kings, a tiara for Queens, a star for Aces and
// a jester's cap for Jokers.

export const crown = (ctx: CanvasRenderingContext2D): void => {
  shape(ctx, 'M-17,8 L-19,-10 L-9,-1 L0,-15 L9,-1 L19,-10 L17,8 Z', paint.brass, paint.ink, 2.5);
  shape(ctx, 'M-17,8 H17 V14 H-17 Z', paint.brassDeep, paint.ink, 2.5);
  [-19, 0, 19].forEach((x, index) => circle(ctx, x, index === 1 ? -15 : -10, 2.6, paint.rust, paint.ink, 1.4));
  circle(ctx, 0, 11, 2, paint.rust, paint.ink, 1.2);
};

export const tiara = (ctx: CanvasRenderingContext2D): void => {
  shape(ctx, 'M-18,10 C-18,-2 -10,-8 -6,-4 C-4,-12 4,-12 6,-4 C10,-8 18,-2 18,10 Z', paint.brassLight, paint.ink, 2.5);
  line(ctx, 'M-18,10 H18', paint.ink, 2.5);
  [-11, 0, 11].forEach((x, index) => circle(ctx, x, index === 1 ? -12 : -5, 2.4, paint.card, paint.ink, 1.4));
  shape(ctx, 'M0,-1 C-4,-6 -9,-1 0,6 C9,-1 4,-6 0,-1 Z', paint.rust, paint.ink, 1.6);
};

export const star = (ctx: CanvasRenderingContext2D): void => {
  const points = Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const radius = index % 2 === 0 ? 18 : 7.5;

    return `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`;
  });

  shape(ctx, `M${points.join(' L')} Z`, paint.ink, paint.ink, 2);
  circle(ctx, 0, 0, 4, paint.brass, paint.ink, 1.4);
};

export const jesterCap = (ctx: CanvasRenderingContext2D): void => {
  shape(ctx, 'M-16,6 L-12,-14 L-4,0 L0,-20 L4,0 L12,-14 L16,6 Z', figurePaint.joker, paint.ink, 2.5);

  [
    [-12, -14],
    [0, -20],
    [12, -14],
  ].forEach(([x, y]) => circle(ctx, x ?? 0, y ?? 0, 3.5, paint.brass, paint.ink, 1.5));

  shape(ctx, 'M-17,4 H17 V11 H-17 Z', paint.card, paint.ink, 2);
};
