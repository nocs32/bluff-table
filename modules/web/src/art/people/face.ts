import type { Character, Mood } from '@bluff-table/protocol';
import { at, circle, line, oval, shape } from '../canvas';
import { figurePaint } from '../palette';
import type { FigurePaint } from './figure';
import { shapes } from './shapes';

// A face, from the look sketches (spec §8.7). (fx, fy) is where the face sits on the head: it
// slides with the look, the cartoon way. `lx` and `ly` are the look itself.

export interface FacePlace {
  fx: number;
  fy: number;
  lx: number;
  ly: number;
}

// Draws a shape from the 140 × 170 box moved so its face is at (fx, fy).
const onFace = (ctx: CanvasRenderingContext2D, fx: number, fy: number, draw: () => void): void => at(ctx, { x: fx - 70, y: fy - 80 }, draw);

export const ears = (ctx: CanvasRenderingContext2D, c: FigurePaint, hx: number, hy: number, lx: number): void => {
  if (lx > -0.55) circle(ctx, hx - 32 + Math.max(0, lx) * 6, hy + 4, 6, c.skin, c.ink, 2.5);

  if (lx < 0.55) circle(ctx, hx + 32 + Math.min(0, lx) * 6, hy + 4, 6, c.skin, c.ink, 2.5);
};

export const hair = (ctx: CanvasRenderingContext2D, character: Character, c: FigurePaint, hx: number, hy: number): void => {
  if (character.hair === 'bald') return;

  if (character.hat === 'none') return onFace(ctx, hx, hy, () => shape(ctx, shapes.topHair, c.hair, c.ink, 2.5));

  if (character.hair === 'long') return;

  onFace(ctx, hx, hy, () => shape(ctx, shapes.sideburns, c.hair, c.ink, 2));
};

const stubbleDots = [[52, 102], [57, 106], [63, 108], [70, 109], [77, 108], [83, 106], [88, 102], [60, 104], [80, 104], [70, 105], [48, 97], [92, 97]] as const;

export const stubble = (ctx: CanvasRenderingContext2D, c: FigurePaint, { fx, fy }: FacePlace): void =>
  onFace(ctx, fx, fy, () => stubbleDots.forEach(([x, y]) => circle(ctx, x, y, 1, c.ink)));

const teeth = (ctx: CanvasRenderingContext2D, c: FigurePaint, fx: number, y: number): void => {
  ctx.beginPath();
  ctx.roundRect(fx - 9, y - 4, 18, 8, 2);
  ctx.fillStyle = figurePaint.apron;
  ctx.fill();
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  line(ctx, `M${fx - 4.5},${y - 4} v8 M${fx},${y - 4} v8 M${fx + 4.5},${y - 4} v8`, c.ink, 1.5);
};

export const mouth = (ctx: CanvasRenderingContext2D, c: FigurePaint, { fx, fy }: FacePlace, mood: Mood): void => {
  const y = fy + 22;

  switch (mood) {
    case 'pull':
      return teeth(ctx, c, fx, y);
    case 'phew':
      return oval(ctx, fx, y - 1, 3.5, 4.5, c.ink);
    case 'sweat':
      return line(ctx, `M${fx - 7.5},${y} q2.5,-3 5,0 q2.5,3 5,0 q2.5,-3 5,0`, c.ink, 2.5);
    case 'dead':
      line(ctx, `M${fx - 7},${y} h14`, c.ink, 3);

      return shape(ctx, `M${fx + 1},${y} q0,9 4,9 q4,0 4,-9`, figurePaint.tongue, c.ink, 2);
    case 'smirk':
      return line(ctx, `M${fx - 6},${y + 1} q7,2 12,-3`, c.ink, 2.5);
    case 'suspicious':
      return line(ctx, `M${fx - 2},${y} h8`, c.ink, 2.5);
    default:
      return line(ctx, `M${fx - 6},${y} h12`, c.ink, 2.5);
  }
};

const moustaches: Partial<Record<Character['face'], string>> = { handlebar: shapes.handlebar, walrus: shapes.walrus, goatee: shapes.goatee, beard: shapes.beardMoustache };

// A colour a shade darker, for the moustache over a full beard.
const darker = (hex: string, k: number): string =>
  `#${[1, 3, 5].map((index) => Math.round(parseInt(hex.slice(index, index + 2), 16) * k).toString(16).padStart(2, '0')).join('')}`;

export const moustache = (ctx: CanvasRenderingContext2D, character: Character, c: FigurePaint, { fx, fy }: FacePlace): void => {
  const d = moustaches[character.face];

  if (!d) return;

  const fill = character.face === 'beard' && c.hair.startsWith('#') ? darker(c.hair, 0.85) : c.hair;

  onFace(ctx, fx, fy, () => shape(ctx, d, fill, c.ink, 2));
};

// A straw from the corner of the mouth (the user's cowboy, spec D7).
export const straw = (ctx: CanvasRenderingContext2D, c: FigurePaint, { fx, fy, lx }: FacePlace): void => {
  const x = fx + 5 + lx * 2;
  const y = fy + 22;
  const tip = `M${x},${y} L${x + 24},${y - 9}`;

  line(ctx, tip, c.ink, 5);
  line(ctx, tip, c.straw, 2.6);
  line(ctx, `M${x + 23},${y - 9} l5,-4 M${x + 23},${y - 9} l6,0 M${x + 23},${y - 9} l4,3`, c.ink, 1.4);
};

type EyePair = (x: number, side: number) => void;

const both = (x1: number, x2: number, draw: EyePair): void => {
  draw(x1, -1);
  draw(x2, 1);
};

export const eyes = (ctx: CanvasRenderingContext2D, c: FigurePaint, x1: number, x2: number, ey: number, place: FacePlace, mood: Mood): void => {
  const px = place.lx * 1.5;
  const py = -place.ly * 1.5;

  switch (mood) {
    case 'pull':
      return both(x1, x2, (x, s) => line(ctx, `M${x + s * 3},${ey - 4} L${x - s * 3},${ey} L${x + s * 3},${ey + 4}`, c.ink, 3));
    case 'phew':
      return both(x1, x2, (x) => line(ctx, `M${x - 5},${ey} q5,4 10,0`, c.ink, 3));
    case 'dead':
      return both(x1, x2, (x) => line(ctx, `M${x - 4},${ey - 4} L${x + 4},${ey + 4} M${x + 4},${ey - 4} L${x - 4},${ey + 4}`, c.ink, 3));
    case 'sweat':
      return both(x1, x2, (x) => oval(ctx, x + px, ey + py, 4, 5, c.ink));
    case 'suspicious':
      return both(x1, x2, (x) => {
        oval(ctx, x + px, ey + py + 0.5, 3.2, 1.9, c.ink);
        line(ctx, `M${x - 5},${ey - 2.5} h10`, c.ink, 2);
      });
    default:
      return both(x1, x2, (x) => oval(ctx, x + px, ey + py, 3, 3.5, c.ink));
  }
};

// Each brow as [outer, inner] rise; negative is up.
const browSets: Partial<Record<Mood, [[number, number], [number, number]]>> = {
  idle: [[-1, 2], [-1, 2]],
  smirk: [[-3, -3], [-1, 2]],
  sweat: [[2, -3], [2, -3]],
  pull: [[-3, 4], [-3, 4]],
  phew: [[-2, -3], [-2, -3]],
  suspicious: [[-4, -5], [0, 3]],
};

export const brows = (ctx: CanvasRenderingContext2D, c: FigurePaint, bushy: boolean, x1: number, x2: number, ey: number, mood: Mood): void => {
  if (mood === 'dead') return;

  const by = ey - 9;
  const width = bushy ? 5 : 4;

  if (bushy && mood === 'idle') return line(ctx, `M${x1 - 7},${by + 1} q7,-5 14,0 M${x2 - 7},${by + 1} q7,-5 14,0`, c.ink, width);

  const [[lo, li], [ro, ri]] = browSets[mood] ?? [[-1, 2], [-1, 2]];

  line(ctx, `M${x1 - 7},${by + lo} L${x1 + 5},${by + li} M${x2 - 5},${by + ri} L${x2 + 7},${by + ro}`, c.ink, width);
};

export const scar = (ctx: CanvasRenderingContext2D, character: Character, c: FigurePaint, x1: number, { fx, fy }: FacePlace, ey: number): void => {
  if (character.scar === 'brow') line(ctx, `M${x1 - 1},${ey - 15} L${x1 + 2},${ey - 5}`, c.scar, 2.2);

  if (character.scar === 'cheek') line(ctx, `M${fx + 13},${fy + 7} L${fx + 20},${fy + 13}`, c.scar, 2.2);
};

export const nose = (ctx: CanvasRenderingContext2D, c: FigurePaint, round: boolean, { fx, fy, lx }: FacePlace): void => {
  if (round) return circle(ctx, fx + lx * 2, fy + 5, 5.5, c.skin, c.ink, 2.5);

  line(ctx, `M${fx + 1},${fy - 2} q${-7 + lx * 13},9 ${1 + lx * 3},11`, c.ink, 2.5);
};

// A drop of sweat flying off.
export const drop = (ctx: CanvasRenderingContext2D, c: FigurePaint, x: number, y: number, s = 1): void =>
  shape(ctx, `M${x},${y} q${-4 * s},${7 * s} 0,${9 * s} q${4 * s},${-2 * s} 0,${-9 * s} Z`, figurePaint.sweat, c.ink, 1.5);
