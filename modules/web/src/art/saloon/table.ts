import { createRandom } from '@bluff-table/engine';
import { cutOut, makeCanvas } from '../canvas';
import { paint } from '../palette';

// The card table seen from above (spec §8.2): an oval of green felt in a wooden rim, inked and cut
// out of card like everything else. The stage lays it flat under the lamp.
export const tableArt = { width: 2048, height: 1300, rim: 0.085 } as const;

const ellipse = (ctx: CanvasRenderingContext2D, rx: number, ry: number): void => {
  ctx.beginPath();
  ctx.ellipse(tableArt.width / 2, tableArt.height / 2, rx, ry, 0, 0, Math.PI * 2);
};

const rimGrain = (ctx: CanvasRenderingContext2D, rx: number, ry: number, depth: number): void => {
  const random = createRandom(13);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.lineWidth = 2;

  for (let line = 0; line < 9; line++) {
    const inset = depth * (0.15 + random() * 0.7);
    const start = random() * Math.PI * 2;

    ctx.beginPath();
    ctx.ellipse(tableArt.width / 2, tableArt.height / 2, rx - inset, ry - inset, 0, start, start + 0.6 + random() * 1.4);
    ctx.stroke();
  }
};

const felt = (ctx: CanvasRenderingContext2D, rx: number, ry: number): void => {
  const random = createRandom(7);

  ellipse(ctx, rx, ry);
  ctx.fillStyle = paint.felt;
  ctx.fill();
  ctx.save();
  ctx.clip();

  for (let speck = 0; speck < 26000; speck++) {
    ctx.fillStyle = random() < 0.5 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.07)';
    ctx.fillRect(random() * tableArt.width, random() * tableArt.height, 2, 2);
  }

  ctx.restore();
  ctx.strokeStyle = 'rgba(243, 230, 200, 0.28)';
  ctx.lineWidth = 3;
  ellipse(ctx, rx * 0.9, ry * 0.86);
  ctx.stroke();
  ctx.strokeStyle = paint.ink;
  ctx.lineWidth = 6;
  ellipse(ctx, rx, ry);
  ctx.stroke();
};

export const drawTableTop = (): HTMLCanvasElement => {
  const { canvas, ctx } = makeCanvas(tableArt.width - 40, tableArt.height - 40);
  const rx = canvas.width / 2 - 12;
  const ry = canvas.height / 2 - 12;
  const depth = canvas.width * tableArt.rim;

  ctx.translate(-20, -20);
  ellipse(ctx, rx, ry);
  ctx.fillStyle = paint.plankLight;
  ctx.fill();
  rimGrain(ctx, rx, ry, depth);
  ctx.strokeStyle = paint.ink;
  ctx.lineWidth = 10;
  ellipse(ctx, rx, ry);
  ctx.stroke();
  felt(ctx, rx - depth, ry - depth);

  return cutOut(canvas, { border: 14 });
};
