import { createRandom } from '@bluff-table/engine';
import { makeCanvas } from '../canvas';
import { paint } from '../palette';

// The table's wooden side, wrapped round under the rim (spec §8.2): the rim's wood running on down,
// grain along it, an ink line where it meets the top and another along its bottom edge.
export const drawApron = (): HTMLCanvasElement => {
  const width = 2048;
  const height = 64;
  const { canvas, ctx } = makeCanvas(width, height);
  const random = createRandom(17);

  ctx.fillStyle = paint.plank;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 2;

  for (let line = 0; line < 40; line++) {
    const y = 10 + random() * (height - 22);
    const start = random() * width;

    ctx.beginPath();
    ctx.moveTo(start, y);
    ctx.bezierCurveTo(start + 60, y + random() * 4 - 2, start + 120, y + random() * 4 - 2, start + 180 + random() * 120, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, height - 18, width, 18);
  ctx.fillStyle = paint.ink;
  ctx.fillRect(0, 0, width, 5);
  ctx.fillRect(0, height - 6, width, 6);

  return canvas;
};
