import type { Character, PlayerColor } from '@bluff-table/protocol';
import { useEffect, useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import {
  drawApron,
  drawBackBar,
  drawChair,
  drawCounter,
  drawDeck,
  drawDoorLeaf,
  drawDoorway,
  drawFloor,
  drawFloorShadow,
  drawLamp,
  drawNameTag,
  drawPolishing,
  drawPoster,
  drawRevolver,
  drawTableLeg,
  drawTableTop,
  drawTentCard,
  drawWall,
  playerPaint,
  renderFigure,
} from '../../../art';

// The stage's textures, drawn by code (spec §8.6) once and handed to the GPU. Each is thrown away
// when what it shows changes (a new name, a new language) or its owner goes. Lettering waits for
// the typefaces: `fonts` turns true once they've loaded, and the textures with text redraw.

// Pixels per unit of the sketches for the people: sharp on a big screen, light on a phone.
export const figureScale = 2.6;

export const toTexture = (canvas: HTMLCanvasElement, repeat?: { x: number; y: number }): CanvasTexture => {
  const texture = new CanvasTexture(canvas);

  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  if (repeat) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeat.x, repeat.y);
  }

  return texture;
};

const useDisposal = (texture: CanvasTexture): CanvasTexture => {
  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
};

// A soft round glow round the lamp's flame, added onto whatever's behind it.
const drawHalo = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 256;
  canvas.height = 256;

  if (!ctx) return canvas;

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);

  gradient.addColorStop(0, 'rgba(255, 210, 122, 0.3)');
  gradient.addColorStop(0.25, 'rgba(255, 190, 100, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 170, 80, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  return canvas;
};

export const useHaloTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawHalo()), []));

export const useWallTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawWall()), []));

export const useFloorTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawFloor(), { x: 10, y: 6 }), []));

export const useBackBarTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawBackBar()), []));

export const useCounterTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawCounter()), []));

export const usePolishingTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawPolishing()), []));

export const useDoorwayTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawDoorway()), []));

export const useDoorLeafTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawDoorLeaf()), []));

export const useLampTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawLamp()), []));

export const useTableTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawTableTop()), []));

export const useTableLegTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawTableLeg()), []));

export const useFloorShadowTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawFloorShadow()), []));

// The table's side wraps all the way round, so its drawing repeats round the oval.
export const useApronTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawApron(), { x: 3, y: 1 }), []));

export const useChairTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawChair()), []));

export const useRevolverTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawRevolver()), []));

export const useDeckTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawDeck()), []));

export const useTentTexture = (name: string, fonts: boolean): CanvasTexture => useDisposal(useMemo(() => toTexture(drawTentCard(name)), [name, fonts]));

export const useNameTagTexture = (name: string, color: PlayerColor, fonts: boolean): CanvasTexture =>
  useDisposal(useMemo(() => toTexture(drawNameTag(name, playerPaint[color])), [name, color, fonts]));

export interface PosterContent {
  character: Character;
  color: PlayerColor;
  wanted: string;
  name: string;
  reward: string;
}

export const usePosterTexture = ({ character, color, wanted, name, reward }: PosterContent, fonts: boolean): CanvasTexture =>
  useDisposal(useMemo(() => toTexture(drawPoster({ character, color }, { wanted, name, reward })), [character, color, wanted, name, reward, fonts]));

// A person's body, or a ghost's: it changes only with their character.
export const useBodyTexture = (character: Character, color: PlayerColor, apron = false): CanvasTexture =>
  useDisposal(useMemo(() => toTexture(renderFigure({ character, color, part: 'body', apron }, figureScale)), [character, color, apron]));
