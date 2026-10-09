import { createRandom } from '@bluff-table/engine';
import { makeCanvas } from '../canvas';
import { paint } from '../palette';

// The table's wooden side, wrapped round under the rim (spec §8.2): the rim's own wood running on
// down, with grain along it, shaded where the rim overhangs it, and cut out of card like every other
// piece: an ink line along the top and, at the bottom, the cream edge of the card between two ink
// lines.
export const apronArt = { width: 2048, height: 128 } as const;

const grain = (ctx: CanvasRenderingContext2D, bottom: number): void => {
  const random = createRandom(17);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.lineWidth = 2;

  for (let line = 0; line < 46; line++) {
    const y = 12 + random() * (bottom - 20);
    const start = random() * apronArt.width;

    ctx.beginPath();
    ctx.moveTo(start, y);
    ctx.bezierCurveTo(start + 60, y + random() * 4 - 2, start + 120, y + random() * 4 - 2, start + 180 + random() * 140, y);
    ctx.stroke();
  }
};

export const drawApron = (): HTMLCanvasElement => {
  const { width, height } = apronArt;
  const { canvas, ctx } = makeCanvas(width, height);
  const edge = 22;
  const bottom = height - edge;
  const overhang = ctx.createLinearGradient(0, 0, 0, bottom);

  ctx.fillStyle = paint.plankLight;
  ctx.fillRect(0, 0, width, bottom);
  grain(ctx, bottom);
  overhang.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
  overhang.addColorStop(0.3, 'rgba(0, 0, 0, 0)');
  overhang.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
  ctx.fillStyle = overhang;
  ctx.fillRect(0, 0, width, bottom);
  ctx.fillStyle = paint.ink;
  ctx.fillRect(0, 0, width, 6);
  ctx.fillRect(0, bottom - 5, width, 5);
  ctx.fillStyle = paint.card;
  ctx.fillRect(0, bottom, width, edge - 4);
  ctx.fillStyle = 'rgba(43, 33, 24, 0.6)';
  ctx.fillRect(0, height - 4, width, 4);

  return canvas;
};
