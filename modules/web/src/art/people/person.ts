import type { Mood } from '@bluff-table/protocol';
import { at, circle, line, shape } from '../canvas';
import { figurePaint } from '../palette';
import { brows, drop, ears, eyes, hair, mouth, moustache, nose, scar, straw, stubble, type FacePlace } from './face';
import { figureColours, type Figure, type FigurePaint } from './figure';
import { fan, gunHand } from './props';
import { cutOutShape, hats, shapes } from './shapes';

// One person as an ink cut-out bust, ported from the look sketches' `person()` (spec §8.7): a
// 140 × 170 box, the head centred at (70, 80). The face slides across the head with the look, the
// far ear hides, the nose points and the hat lags a little.

const clampUnit = (value: number): number => Math.max(-1, Math.min(1, value));

interface Head {
  hx: number;
  hy: number;
  place: FacePlace;
  mood: Mood;
}

const headOf = (figure: Figure): Head => {
  const lx = clampUnit(figure.look?.x ?? 0);
  const ly = clampUnit(figure.look?.y ?? 0);
  const hx = 70 + lx * 3;
  const hy = 80 - ly * 3;

  return { hx, hy, place: { fx: hx + lx * 9, fy: hy - ly * 8, lx, ly }, mood: figure.mood ?? 'idle' };
};

const body = (ctx: CanvasRenderingContext2D, figure: Figure, c: FigurePaint): void => {
  if (figure.ghost) return shape(ctx, shapes.ghost, c.coat, c.ink, 2);

  line(ctx, shapes.coat, c.card, 8);
  shape(ctx, `${shapes.coat} Z`, c.coat);
  line(ctx, shapes.coat, c.ink, 3);
  shape(ctx, 'M58,117 L70,140 L82,117 Z', c.shirt, c.ink, 2.5);

  if (figure.apron) shape(ctx, shapes.apron, figurePaint.apron, c.ink, 2.5);
};

// The beard's cut-out edge goes under everything, its hair over the face.
const beardAt = (ctx: CanvasRenderingContext2D, place: FacePlace, draw: () => void): void => {
  ctx.save();
  ctx.translate(place.fx, place.fy);
  ctx.scale(1 - Math.abs(place.lx) * 0.12, 1);
  ctx.translate(-70, -80);
  draw();
  ctx.restore();
};

const faceFeatures = (ctx: CanvasRenderingContext2D, figure: Figure, c: FigurePaint, { place, mood }: Head): void => {
  const { character } = figure;
  const gap = 10 - Math.abs(place.lx) * 1.5;
  const x1 = place.fx - gap;
  const x2 = place.fx + gap;
  const ey = place.fy - 3;

  if (character.face === 'stubble' || character.face === 'handlebar') stubble(ctx, c, place);

  if (character.face === 'beard') {
    beardAt(ctx, place, () => {
      shape(ctx, shapes.beard, c.hair, c.ink, 3);
      line(ctx, shapes.beardLines, c.ink, 1.5);
    });
  }

  if (character.face === 'goatee') at(ctx, { x: place.fx - 70, y: place.fy - 80 }, () => shape(ctx, shapes.chin, c.hair, c.ink, 2));

  mouth(ctx, c, place, mood);
  moustache(ctx, character, c, place);

  if (character.straw && mood !== 'dead' && mood !== 'pull') straw(ctx, c, place);

  nose(ctx, c, character.face === 'beard', place);
  eyes(ctx, c, x1, x2, ey, place, mood);
  brows(ctx, c, character.face === 'beard', x1, x2, ey, mood);
  scar(ctx, character, c, x1, place, ey);
};

const head = (ctx: CanvasRenderingContext2D, figure: Figure, c: FigurePaint, spot: Head): void => {
  const { character } = figure;
  const { hx, hy, place, mood } = spot;
  const pale = mood === 'dead' && !figure.ghost && !figure.silhouette;

  circle(ctx, hx, hy, 38, c.card);

  if (character.face === 'beard') beardAt(ctx, place, () => cutOutShape(ctx, shapes.beard, c));

  if (character.hair === 'long') at(ctx, { x: hx - 70, y: hy - 80 }, () => shape(ctx, shapes.longHair, c.hair, c.ink, 2.5));

  ears(ctx, c, hx, hy, place.lx);
  circle(ctx, hx, hy, 32, pale ? figurePaint.pale : c.skin, c.ink, 3);
  hair(ctx, character, c, hx, hy);
  faceFeatures(ctx, figure, c, spot);
};

// The head and its hat, where they are: slumped and hatless when dead.
const headAndHat = (ctx: CanvasRenderingContext2D, figure: Figure, c: FigurePaint, place: Head): void => {
  const hat = (): void => hats[figure.character.hat](ctx, c);

  if (place.mood === 'dead') {
    at(ctx, { x: 6, y: 44 }, () => at(ctx, { x: 70, y: 80, rotate: 20 }, () => at(ctx, { x: -70, y: -80 }, () => head(ctx, figure, c, place))));
    at(ctx, { x: 40, y: -34 }, () => at(ctx, { x: 70, y: 44, rotate: -26 }, () => at(ctx, { x: -70, y: -44 }, hat)));

    return;
  }

  const { lx, ly } = place.place;

  head(ctx, figure, c, place);
  at(ctx, { x: place.hx - 70 + lx * 2, y: place.hy - 80 - ly * 2 + (ly < 0 ? -ly * 4 : 0) }, hat);
};

// Draws `figure` into the 140 × 170 box at the context's origin.
export const drawPerson = (ctx: CanvasRenderingContext2D, figure: Figure): void => {
  const c = figureColours(figure);
  const place = headOf(figure);

  ctx.save();

  if (figure.ghost) ctx.globalAlpha = 0.72;

  if (figure.part !== 'head') body(ctx, figure, c);

  if (figure.part !== 'body') {
    headAndHat(ctx, figure, c, place);

    if (figure.gun) gunHand(ctx, c, place.hx, place.hy);

    if (figure.cards) fan(ctx, c, figure.cards);

    if ((place.mood === 'sweat' || place.mood === 'pull') && !figure.silhouette) {
      drop(ctx, c, place.hx + 30, place.hy - 30);
      drop(ctx, c, place.hx - 38, place.hy - 16, 0.8);
      drop(ctx, c, place.hx + 36, place.hy - 6, 0.7);
    }
  }

  ctx.restore();
};
