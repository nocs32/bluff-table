import type { CardRank } from '@bluff-table/protocol';
import { at, box, cutOut, line, makeCanvas, setFont, text } from '../canvas';
import { figurePaint, paint } from '../palette';
import { crown, jesterCap, star, tiara } from './emblems';

// The cards (spec §5.1, §8.6), drawn by code like everything else: cream card stock with an ink
// edge, ported from the sketches' `cardFace()`, with each rank's picture so they read at a glance.
// In the sketches' units, a card is 74 × 104; four pixels each.
const scale = 4;

export const cardSize = { width: 74, height: 104 } as const;

const emblems: Record<CardRank, (ctx: CanvasRenderingContext2D) => void> = { king: crown, queen: tiara, ace: star, joker: jesterCap };

// The corner letter, the same everywhere cards are played.
const letters: Record<CardRank, string> = { king: 'K', queen: 'Q', ace: 'A', joker: '★' };

const inkOf = (rank: CardRank): string => (rank === 'ace' ? paint.ink : rank === 'joker' ? figurePaint.joker : paint.redInk);

const corner = (ctx: CanvasRenderingContext2D, rank: CardRank, x: number, y: number): void => {
  setFont(ctx, 15);
  text(ctx, letters[rank], x, y, inkOf(rank));
};

const card = (draw: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement => {
  const { width, height } = cardSize;
  const { canvas, ctx } = makeCanvas((width + 4) * scale, (height + 4) * scale);

  ctx.scale(scale, scale);
  ctx.translate(2, 2);
  draw(ctx);

  return canvas;
};

export const drawCardFace = (rank: CardRank): HTMLCanvasElement =>
  card((ctx) => {
    const { width, height } = cardSize;

    box(ctx, 0, 0, width, height, 7, paint.card, paint.ink, 3);
    box(ctx, 6, 6, width - 12, height - 12, 4, 'none', 'rgba(43, 33, 24, 0.45)', 1);
    at(ctx, { x: width / 2, y: height / 2 - 6, scale: 1.25 }, () => emblems[rank](ctx));
    setFont(ctx, rank === 'joker' ? 11 : 26);
    text(ctx, rank === 'joker' ? 'JOKER' : letters[rank], width / 2, height - 22, inkOf(rank));
    corner(ctx, rank, 14, 16);
    corner(ctx, rank, width - 14, 16);
  });

// The back every card shares: the saloon's red with a printed lattice and a star in the middle.
export const drawCardBack = (): HTMLCanvasElement =>
  card((ctx) => {
    const { width, height } = cardSize;
    const lattice = Array.from({ length: 12 }, (_, index) => `M${index * 12 - 60},6 l${height},${height} M${index * 12 + 10},6 l-${height},${height}`).join(' ');

    box(ctx, 0, 0, width, height, 7, figurePaint.back, paint.ink, 3);
    ctx.save();
    box(ctx, 6, 6, width - 12, height - 12, 4, 'none');
    ctx.clip();
    line(ctx, lattice, 'rgba(243, 230, 200, 0.22)', 1.4);
    ctx.restore();
    box(ctx, 6, 6, width - 12, height - 12, 4, 'none', paint.card, 1.6);
    at(ctx, { x: width / 2, y: height / 2, scale: 0.9 }, () => star(ctx));
  });

// A card as a piece of the scene, with its cut-out edge (spec §8.1). A flipped card that was a lie
// gets a red edge (spec §8.4).
export const drawTableCard = (rank: CardRank | null, lie = false): HTMLCanvasElement => {
  const card = rank ? drawCardFace(rank) : drawCardBack();

  if (lie) {
    const ctx = card.getContext('2d');

    ctx?.setTransform(scale, 0, 0, scale, 2 * scale, 2 * scale);

    if (ctx) box(ctx, 0, 0, cardSize.width, cardSize.height, 7, 'none', paint.rustHot, 5);
  }

  return cutOut(card, { border: 8 });
};

// The table card in its brass holder, standing in the middle of the table (spec §8.2).
export const drawTableCardStand = (rank: CardRank): HTMLCanvasElement => {
  const { width, height } = cardSize;
  const face = drawCardFace(rank);
  const { canvas, ctx } = makeCanvas((width + 20) * scale, (height + 26) * scale);

  ctx.drawImage(face, 10 * scale, 0);
  ctx.scale(scale, scale);
  box(ctx, 2, height - 6, width + 16, 14, 4, paint.brass, paint.ink, 2.5);
  line(ctx, `M8,${height + 1} H${width + 12}`, paint.brassDeep, 2);
  box(ctx, 14, height + 8, width - 8, 10, [0, 0, 4, 4], paint.brassDeep, paint.ink, 2.5);

  return cutOut(canvas, { border: 8, shadow: 0 });
};
