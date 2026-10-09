import { useMemo } from 'react';
import type { CanvasTexture } from 'three';

// Where a cut-out is held from: its bottom edge (standing on something), its middle, or its top
// edge (hanging).
export type CutoutAnchor = 'bottom' | 'center' | 'top';

export interface CutoutSize {
  width: number;
  height: number;
  // How far the plane's middle sits above the anchor.
  lift: number;
}

// A cut-out's size in metres from its drawing's proportions, `width` across.
export const useCutoutSize = (texture: CanvasTexture, width: number, anchor: CutoutAnchor): CutoutSize =>
  useMemo((): CutoutSize => {
    const image = texture.image as HTMLCanvasElement;
    const height = (width * image.height) / image.width;
    const lift = { bottom: height / 2, center: 0, top: -height / 2 }[anchor];

    return { width, height, lift };
  }, [texture, width, anchor]);
