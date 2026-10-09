import { paint } from '../palette';
import { fitFont, makeCanvas } from './canvas';

// A switch's tent card (spec §5.10): cream card stock with an ink edge, a brass band across the top,
// and the switch's name. A placeholder until M1 draws the saloon's own.
export const drawTentCard = (name: string): HTMLCanvasElement => {
  const width = 512;
  const height = 256;
  const { canvas, ctx } = makeCanvas(width, height);
  const band = 56;

  ctx.fillStyle = paint.card;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = paint.brass;
  ctx.fillRect(0, 0, width, band);
  ctx.fillStyle = paint.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  fitFont(ctx, name, width - 50, 64);
  ctx.fillText(name, width / 2, band + (height - band) / 2 + 4);
  ctx.lineWidth = 12;
  ctx.strokeStyle = paint.ink;
  ctx.strokeRect(0, 0, width, height);

  return canvas;
};
