import type { CharacterHat } from '@bluff-table/protocol';
import { line, shape } from '../canvas';
import type { FigurePaint } from './figure';

// The people's shapes, from the look sketches (spec §8.7), for a bust in a 140 × 170 box with the
// head centred at (70, 80).
export const shapes = {
  beard: 'M40,80 C40,96 46,120 70,126 C94,120 100,96 100,80 C96,92 88,96 80,94 C74,92 66,92 60,94 C52,96 44,92 40,80 Z',
  beardLines: 'M52,104 q4,6 2,12 M70,106 q2,8 0,14 M88,104 q-4,6 -2,12 M60,112 q2,4 1,8 M80,112 q-2,4 -1,8',
  handlebar: 'M70,93 C64,89 56,90 52,94 C48,98 44,96 44,92 C46,99 56,100 62,97 C66,96 68,95 70,95 C72,95 74,96 78,97 C84,100 94,99 96,92 C96,96 92,98 88,94 C84,90 76,89 70,93 Z',
  walrus: 'M54,90 C58,83 82,83 86,90 C89,99 84,103 80,99 C77,96 73,96 70,99 C67,96 63,96 60,99 C56,103 51,99 54,90 Z',
  goatee: 'M60,94 C64,90 68,91 70,92 C72,91 76,90 80,94 C76,95 73,95 70,94 C67,95 64,95 60,94 Z',
  chin: 'M64,106 C64,113 67,117 70,119 C73,117 76,113 76,106 C73,108 67,108 64,106 Z',
  beardMoustache: 'M57,94 C61,88 68,89 70,91 C72,89 79,88 83,94 C78,96 74,95 70,93 C66,95 62,96 57,94 Z',
  longHair: 'M36,70 C34,44 106,44 104,70 C106,96 108,118 100,130 C92,122 96,98 94,86 L46,86 C44,98 48,122 40,130 C32,118 34,96 36,70 Z',
  topHair: 'M39,76 C36,46 104,46 101,76 C96,62 82,56 70,58 C58,56 44,62 39,76 Z',
  sideburns: 'M39,76 C37,66 39,60 43,57 L46,72 Z M101,76 C103,66 101,60 97,57 L94,72 Z',
  coat: 'M20,170 C22,132 42,116 70,116 C98,116 118,132 120,170',
  ghost: 'M30,170 C28,132 44,116 70,116 C96,116 112,132 110,170 l-10,-8 l-10,8 l-10,-8 l-10,8 l-10,-8 l-10,8 l-10,-8 l-10,8 Z',
  // The barkeep's apron, tied over his shirt.
  apron: 'M40,170 L44,132 C52,128 88,128 96,132 L100,170 Z',
};

// A part cut out of card: a thick cream outline under it, as in the sketches.
export const cutOutShape = (ctx: CanvasRenderingContext2D, d: string, c: FigurePaint): void => shape(ctx, d, c.card, c.card, 8);

const banded = (ctx: CanvasRenderingContext2D, crown: string, brim: string, band: { x: number; y: number; w: number; h: number }, c: FigurePaint): void => {
  cutOutShape(ctx, `${crown} ${brim}`, c);
  shape(ctx, crown, c.hat, c.ink, 3);
  ctx.beginPath();
  ctx.rect(band.x, band.y, band.w, band.h);
  ctx.fillStyle = c.band;
  ctx.fill();
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  shape(ctx, brim, c.hat, c.ink, 3);
};

// The cowboy hat the user asked for (spec D7): a pinched crown, a brim curled up at the sides, and
// a twisted rope band.
const cowboy = (ctx: CanvasRenderingContext2D, c: FigurePaint): void => {
  const crown = 'M45,52 C42,36 48,25 58,27 C63,31 77,31 82,27 C92,25 98,36 95,52 Z';
  const brim = 'M17,43 C22,56 40,60 70,60 C100,60 118,56 123,43 C116,50 104,52 95,50 L45,50 C36,52 24,50 17,43 Z';

  cutOutShape(ctx, `${crown} ${brim}`, c);
  shape(ctx, crown, c.hat, c.ink, 3);
  line(ctx, 'M70,30 v8', c.ink, 1.5);
  shape(ctx, 'M45,43 H95 V49 H45 Z', c.band, c.ink, 1.5);

  for (let x = 47; x < 95; x += 4) line(ctx, `M${x},49 l3,-6`, c.ink, 1);

  shape(ctx, brim, c.hat, c.ink, 3);
};

// Hats, drawn for a head centred at (70, 80).
export const hats: Record<CharacterHat, (ctx: CanvasRenderingContext2D, c: FigurePaint) => void> = {
  stetson: (ctx, c) => {
    const crown = 'M46,52 C46,28 58,30 70,36 C82,30 94,28 94,52 Z';
    const brim = 'M26,54 C40,46 100,46 114,54 C100,60 40,60 26,54 Z';

    banded(ctx, crown, brim, { x: 47, y: 44, w: 46, h: 6 }, c);
  },
  cowboy,
  bowler: (ctx, c) => {
    const crown = 'M48,52 C48,26 92,26 92,52 Z';
    const brim = 'M34,52 a36,6 0 1 0 72,0 a36,6 0 1 0 -72,0 Z';

    cutOutShape(ctx, `${crown} ${brim}`, c);
    shape(ctx, crown, c.hat, c.ink, 3);
    line(ctx, 'M49,46 H91', c.ink, 3);
    shape(ctx, brim, c.hat, c.ink, 3);
  },
  fedora: (ctx, c) => {
    const crown = 'M46,52 C44,36 50,26 60,28 C64,32 76,32 80,28 C90,26 96,36 94,52 Z';
    const brim = 'M24,55 C36,46 104,46 116,52 C106,60 34,62 24,55 Z';

    banded(ctx, crown, brim, { x: 46, y: 43, w: 48, h: 7 }, c);
  },
  flatcap: (ctx, c) => {
    const cap = 'M36,60 C36,36 62,32 82,36 C100,40 106,50 104,58 C114,60 118,62 114,65 C100,66 60,64 36,60 Z';

    cutOutShape(ctx, cap, c);
    shape(ctx, cap, c.hat, c.ink, 3);
    line(ctx, 'M48,52 q22,-14 48,0', c.ink, 1.5);
    ctx.beginPath();
    ctx.arc(68, 36, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = c.hat;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = c.ink;
    ctx.stroke();
  },
  none: () => undefined,
};
