import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { NeutralToneMapping, type PerspectiveCamera } from 'three';
import type { TableInsets } from '../../../stores/table';
import { stage } from './layout';

const { camera: view } = stage;
// How far the scene reaches round the camera's target that must stay in view: the places across
// the table side to side, and the table's near edge to the lamp up and down.
const reach = { width: 2.25, height: 1.75 };
const distanceRange = { min: 4.2, max: 12 };

const clampDistance = (distance: number): number => Math.min(distanceRange.max, Math.max(distanceRange.min, distance));

// The camera never moves on its own (spec D5): from your seat it looks across the table, a little
// down, and frames the places, the table and the lamp in the part of the screen the lobby leaves
// free, backing off on narrow screens. When the free part isn't in the middle, the view is shifted
// so the table is in the middle of what's free.
export const useRoomTableCamera = ({ left, right, bottom }: TableInsets): void => {
  const { camera, size, gl } = useThree();

  // Neutral tone mapping keeps the drawings' inks and card true under the lamp.
  useLayoutEffect(() => {
    gl.toneMapping = NeutralToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl]);

  useLayoutEffect(() => {
    const lens = camera as PerspectiveCamera;
    const half = Math.tan((view.fov * Math.PI) / 360);
    const free = { width: Math.max(160, size.width - left - right), height: Math.max(160, size.height - bottom) };
    const distance = clampDistance(Math.max(reach.width / (half * (free.width / size.height)), (reach.height / half) * (size.height / free.height)));

    lens.fov = view.fov;
    lens.position.set(view.target.x, view.target.y + Math.sin(view.pitch) * distance, view.target.z + Math.cos(view.pitch) * distance);
    lens.lookAt(view.target.x, view.target.y, view.target.z);
    // A shift only: the window onto the view moves, the lens's angle stays the same.
    lens.setViewOffset(size.width, size.height, -(left - right) / 2, bottom / 2, size.width, size.height);
    lens.updateProjectionMatrix();
  }, [camera, size.width, size.height, left, right, bottom]);
};
