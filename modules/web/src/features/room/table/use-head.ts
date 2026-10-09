import type { Character, Mood, PlayerColor } from '@bluff-table/protocol';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { CanvasTexture } from 'three';
import { figureCanvas, paintFigure } from '../../../art';
import { figureScale, toTexture } from './use-textures';

// Where a head on the stage looks, as drawn (right and up positive), and the face it pulls.
export interface HeadAim {
  x: number;
  y: number;
  mood: Mood;
}

// A head is redrawn only when its look moves by a step this small, or its face changes (spec
// §10.2): smooth to the eye, and no drawing on frames where nothing shows.
const steps = 25;

const quantize = (value: number): number => Math.round(value * steps) / steps;

interface HeadCanvas {
  canvas: HTMLCanvasElement;
  texture: CanvasTexture;
}

// A person's head on its own plane, drawn into its own canvas every time `aim` says it moved
// (spec §8.3): the face slides, the far ear hides, the hat lags. Read every frame, outside React.
export const useRoomTableHead = (character: Character, color: PlayerColor, apron: boolean, aim: (time: number) => HeadAim): CanvasTexture => {
  const head = useMemo((): HeadCanvas => {
    const canvas = figureCanvas(figureScale);

    return { canvas, texture: toTexture(canvas) };
  }, []);

  const drawn = useRef('');

  useEffect(() => () => head.texture.dispose(), [head]);

  useFrame(({ clock }) => {
    const { x, y, mood } = aim(clock.elapsedTime);
    const look = { x: quantize(x), y: quantize(y) };
    const key = `${character.hat}${character.face}${character.hair}${character.scar}${character.straw}${character.hairTone}${color}|${look.x}|${look.y}|${mood}`;

    if (key === drawn.current) return;

    drawn.current = key;
    paintFigure(head.canvas, { character, color, apron, look, mood, part: 'head' }, figureScale);
    head.texture.needsUpdate = true;
  });

  return head.texture;
};
