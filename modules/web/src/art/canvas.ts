import { artFonts, paint } from './palette';

// Drawing helpers shared by all the art: canvases, ink paths in SVG path syntax (the sketches'
// shapes carry over as they are), and the cut-out edge every piece of the scene has (spec §8.1).

export interface ArtCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export const makeCanvas = (width: number, height: number): ArtCanvas => {
  const canvas = document.createElement('canvas');

  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);

  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No 2D canvas');

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  return { canvas, ctx };
};

// A shape in SVG path syntax, filled and outlined. 'none' skips either.
export const shape = (ctx: CanvasRenderingContext2D, d: string, fill: string, stroke = 'none', width = 0): void => {
  const path = new Path2D(d);

  if (fill !== 'none') {
    ctx.fillStyle = fill;
    ctx.fill(path);
  }

  if (stroke !== 'none' && width > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke(path);
  }
};

export const line = (ctx: CanvasRenderingContext2D, d: string, stroke: string, width: number): void => shape(ctx, d, 'none', stroke, width);

export const circle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke = 'none', width = 0): void => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);

  if (fill !== 'none') {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke !== 'none' && width > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
};

export const oval = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, stroke = 'none', width = 0): void => {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);

  if (fill !== 'none') {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke !== 'none' && width > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
};

export const box = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[], fill: string, stroke = 'none', width = 0): void => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);

  if (fill !== 'none') {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke !== 'none' && width > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
};

interface Placement {
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
}

// Draws with the origin moved to (x, y), scaled and turned (degrees), like the sketches' `at()`.
export const at = (ctx: CanvasRenderingContext2D, { x, y, scale = 1, rotate = 0 }: Placement, draw: () => void): void => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate((rotate * Math.PI) / 180);
  draw();
  ctx.restore();
};

export type TextFace = 'display' | 'body';

export const setFont = (ctx: CanvasRenderingContext2D, size: number, face: TextFace = 'display', weight = 800): void => {
  ctx.font = `${weight} ${size}px ${artFonts[face]}`;
};

// The biggest size (up to `size`) at which `text` fits in `width`, set as the context's font.
export const fitFont = (ctx: CanvasRenderingContext2D, text: string, width: number, size: number, face: TextFace = 'display', weight = 800): number => {
  let fitted = size;

  setFont(ctx, fitted, face, weight);

  while (fitted > 6 && ctx.measureText(text).width > width) {
    fitted -= 1;
    setFont(ctx, fitted, face, weight);
  }

  return fitted;
};

export const text = (ctx: CanvasRenderingContext2D, value: string, x: number, y: number, fill: string, align: CanvasTextAlign = 'center'): void => {
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
};

// Points round a circle, for growing a shape into a border.
const ring = (radius: number, steps: number): Array<[number, number]> =>
  Array.from({ length: steps }, (_, step) => [Math.cos((step / steps) * Math.PI * 2) * radius, Math.sin((step / steps) * Math.PI * 2) * radius]);

// The shape of `source` grown by `radius`, in one colour.
const grown = (source: HTMLCanvasElement, radius: number, fill: string, pad: number): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(source.width + pad * 2, source.height + pad * 2);

  ring(radius, 24).forEach(([dx, dy]) => ctx.drawImage(source, pad + dx, pad + dy));
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
};

export interface CutOutOptions {
  // The cream border round the drawing, in pixels.
  border: number;
  // A soft shadow under it, for pieces that lie on something (posters on the wall).
  shadow?: number;
}

// A drawing cut out of card (spec §8.1): a cream border round its edge, a faint line where the card
// was cut, and optionally a soft shadow under it. The result is bigger by the border (and shadow).
export const cutOut = (source: HTMLCanvasElement, { border, shadow = 0 }: CutOutOptions): HTMLCanvasElement => {
  const pad = Math.ceil(border + 2 + shadow * 1.6);
  const card = grown(source, border, paint.card, pad);
  const edge = grown(source, border + 1.5, 'rgba(43, 33, 24, 0.45)', pad);
  const { canvas, ctx } = makeCanvas(card.width, card.height);

  if (shadow > 0) {
    ctx.save();
    ctx.filter = `blur(${shadow}px)`;
    ctx.globalAlpha = 0.6;
    ctx.drawImage(grown(source, border + 1.5, 'black', pad), shadow * 0.25, shadow * 0.6);
    ctx.restore();
  }

  ctx.drawImage(edge, 0, 0);
  ctx.drawImage(card, 0, 0);
  ctx.drawImage(source, pad, pad);

  return canvas;
};
