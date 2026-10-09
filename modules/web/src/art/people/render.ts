import { makeCanvas } from '../canvas';
import type { Figure } from './figure';
import { drawPerson } from './person';

// The box a figure is drawn in, in the sketches' units: the 140 × 170 bust with room round it for
// the cut-out edge, a cowboy hat's brim and the revolver.
export const figureBox = { x: -12, y: -12, width: 164, height: 194 } as const;

// Where the head's centre sits in the box, as a share of its width and height.
export const headInBox = { x: (70 - figureBox.x) / figureBox.width, y: (80 - figureBox.y) / figureBox.height } as const;

// Draws `figure` onto a canvas sized for `scale` pixels per unit, clearing it first. The same
// canvas is drawn into again when the head turns.
export const paintFigure = (canvas: HTMLCanvasElement, figure: Figure, scale: number): void => {
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.setTransform(scale, 0, 0, scale, -figureBox.x * scale, -figureBox.y * scale);
  drawPerson(ctx, figure);
};

export const figureCanvas = (scale: number): HTMLCanvasElement => makeCanvas(figureBox.width * scale, figureBox.height * scale).canvas;

export const renderFigure = (figure: Figure, scale: number): HTMLCanvasElement => {
  const canvas = figureCanvas(scale);

  paintFigure(canvas, figure, scale);

  return canvas;
};

// A head and hat, square, for chips and posters: the bust cropped round the face.
export const renderPortrait = (figure: Figure, size: number): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(size, size);
  // The crop, in the sketches' units: the hat's top to the chin, centred on the face.
  const crop = { x: 70, y: 74, half: 54 };
  const scale = size / (crop.half * 2);

  ctx.setTransform(scale, 0, 0, scale, (crop.half - crop.x) * scale, (crop.half - crop.y) * scale);
  drawPerson(ctx, { ...figure, part: 'head' });

  return canvas;
};
