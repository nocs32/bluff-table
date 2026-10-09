import { useEffect, useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { drawFelt, drawPanelling, drawTentCard } from '../../../art';

// The table's textures, drawn by code (spec §8.6) once and handed to the GPU. Each is thrown away
// when what it shows changes (a new language, say) or its owner goes.

const toTexture = (canvas: HTMLCanvasElement, repeat = 1): CanvasTexture => {
  const texture = new CanvasTexture(canvas);

  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  if (repeat !== 1) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeat, repeat / 4);
  }

  return texture;
};

const useDisposal = <T extends CanvasTexture | null>(texture: T): T => {
  useEffect(() => () => texture?.dispose(), [texture]);

  return texture;
};

export const useFeltTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawFelt()), []));

export const usePanellingTexture = (): CanvasTexture => useDisposal(useMemo(() => toTexture(drawPanelling(), 8), []));

export const useTentTexture = (name: string): CanvasTexture => useDisposal(useMemo(() => toTexture(drawTentCard(name)), [name]));
