import { box, circle, cutOut, line, makeCanvas, oval, shape } from '../canvas';
import { paint } from '../palette';

// The revolver lying on the felt (spec D20, §8.2): a real-looking single-action six-shooter, inked
// like everything else. Barrel with its front sight and the ejector rod under it, the fluted
// cylinder, the frame, the hammer, the trigger in its guard, and a walnut grip. Muzzle to the left,
// in the sketches' units, eight pixels each.
const scale = 8;
const size = { width: 120, height: 76 };
const shine = 'rgba(255, 255, 255, 0.45)';

const barrel = (ctx: CanvasRenderingContext2D): void => {
  shape(ctx, 'M6,22 H66 V31 H6 Q3,26.5 6,22 Z', paint.steel, paint.ink, 2.2);
  shape(ctx, 'M9,22 L11,17.5 H14 L15,22 Z', paint.steel, paint.ink, 1.6);
  oval(ctx, 5.5, 26.5, 1.4, 2.6, paint.hole);
  // The ejector rod's housing under the barrel, and its knob.
  shape(ctx, 'M20,31 H60 V36 H22 Q19,33.5 20,31 Z', paint.steel, paint.ink, 1.8);
  circle(ctx, 20, 33.5, 2.6, paint.cylinder, paint.ink, 1.5);
  line(ctx, 'M9,23.6 H64', shine, 1.2);
};

const cylinder = (ctx: CanvasRenderingContext2D): void => {
  box(ctx, 64, 15, 26, 26, 4, paint.cylinder, paint.ink, 2.4);
  // Flutes between the chambers.
  [21, 28, 35].forEach((y) => box(ctx, 68, y - 1.6, 18, 3.2, 1.6, paint.steel, paint.ink, 1.1));
  line(ctx, 'M67,16.8 H87', shine, 1.2);
  [18.5, 37.5].forEach((y) => oval(ctx, 65.2, y, 0.9, 1.6, paint.hole));
};

const frame = (ctx: CanvasRenderingContext2D): void => {
  shape(ctx, 'M58,17 H66 V40 H58 Z', paint.steel, paint.ink, 2);
  shape(ctx, 'M62,13 H96 V17 H62 Z', paint.steel, paint.ink, 1.8);
  shape(ctx, 'M88,13 H98 L100,40 H88 Z', paint.steel, paint.ink, 2.2);
  // The hammer, cocked back, with its knurled spur.
  shape(ctx, 'M93,13 L97,4 L104,3 L106,6 L100,9 L99,15 Z', paint.steel, paint.ink, 1.8);
  line(ctx, 'M99,4.5 l1,3 M101.5,4 l1,3 M104,3.8 l0.8,2.6', paint.ink, 0.9);
  circle(ctx, 94, 27, 1.5, paint.chamber, paint.ink, 0.9);
};

const trigger = (ctx: CanvasRenderingContext2D): void => {
  shape(ctx, 'M74,40 C74,52 80,56 88,56 C94,56 98,52 98,40 L95,40 C95,50 92,53 88,53 C82,53 77,50 77,40 Z', paint.brass, paint.ink, 1.8);
  line(ctx, 'M88,40 C88,45 86,48 84,50', paint.ink, 3);
  line(ctx, 'M88,40 C88,45 86,48 84,50', paint.steel, 1.4);
};

const grip = (ctx: CanvasRenderingContext2D): void => {
  const outline = 'M96,38 C100,46 108,58 114,68 C112,72 106,74 102,72 C98,62 92,52 87,43 Z';

  shape(ctx, outline, paint.grip, paint.ink, 2.4);
  line(ctx, 'M95,44 C100,52 104,60 108,68 M92,46 C96,54 100,62 104,70', 'rgba(0, 0, 0, 0.25)', 1.1);
  line(ctx, 'M98,40 C103,48 110,60 115,68', paint.steel, 2);
  circle(ctx, 99, 55, 1.6, paint.chamber, paint.ink, 0.9);
};

export const drawRevolver = (): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(size.width * scale, size.height * scale);

  ctx.scale(scale, scale);
  grip(ctx);
  barrel(ctx);
  trigger(ctx);
  frame(ctx);
  cylinder(ctx);

  return cutOut(canvas, { border: 12 });
};
