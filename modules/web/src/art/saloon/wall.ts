import { createRandom } from '@bluff-table/engine';
import { circle, makeCanvas } from '../canvas';
import { paint } from '../palette';

// The saloon's plank walls and floor (spec §8.2), inked like the rest: boards of slightly different
// browns, ink grooves between them, grain, and nail heads.

const grain = (ctx: CanvasRenderingContext2D, random: () => number, x: number, width: number, height: number): void => {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1.4;

  for (let line = 0; line < 5; line++) {
    const start = x + 6 + random() * (width - 12);

    ctx.beginPath();
    ctx.moveTo(start, 0);
    ctx.bezierCurveTo(start + random() * 10 - 5, height * 0.33, start + random() * 10 - 5, height * 0.66, start + random() * 8 - 4, height);
    ctx.stroke();
  }

  // A knot now and then.
  if (random() < 0.35) {
    ctx.beginPath();
    ctx.ellipse(x + width * (0.3 + random() * 0.4), random() * height, 4, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
};

// Vertical boards over the whole wall, a rail at chair height, and the wainscot under it.
export const drawWall = (): HTMLCanvasElement => {
  const width = 2048;
  const height = 768;
  const board = 58;
  const rail = Math.round(height * 0.7);
  const { canvas, ctx } = makeCanvas(width, height);
  const random = createRandom(23);
  const browns = [paint.plank, paint.plankDark, paint.plank, paint.plankLight];

  for (let x = 0; x < width; x += board) {
    ctx.fillStyle = browns[Math.floor(random() * browns.length)] ?? paint.plank;
    ctx.fillRect(x, 0, board, height);
    grain(ctx, random, x, board, height);
    ctx.fillStyle = paint.groove;
    ctx.fillRect(x, 0, 4, height);
    [26, rail - 22, height - 30].forEach((y) => circle(ctx, x + board / 2, y, 2.6, paint.groove));
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.fillRect(0, rail, width, height - rail);
  ctx.fillStyle = paint.plankLight;
  ctx.fillRect(0, rail - 10, width, 20);
  ctx.strokeStyle = paint.ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(-4, rail - 10, width + 8, 20);

  return canvas;
};

// The floor: long boards running away from you, repeated across the room.
export const drawFloor = (): HTMLCanvasElement => {
  const size = 512;
  const board = 64;
  const { canvas, ctx } = makeCanvas(size, size);
  const random = createRandom(31);

  for (let x = 0; x < size; x += board) {
    ctx.fillStyle = random() < 0.5 ? paint.plankDark : paint.groove;
    ctx.fillRect(x, 0, board, size);
    grain(ctx, random, x, board, size);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, 0, 3, size);
    ctx.fillRect(x, Math.floor(random() * size), board, 3);
  }

  return canvas;
};
