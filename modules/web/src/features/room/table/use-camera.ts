import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import type { PerspectiveCamera } from 'three';

// How far the table reaches, rail and all, from its middle: the camera keeps all of it in view.
const reach = { width: 2.15, depth: 1.5 };
// Looking down at the table at an angle, as if from your chair, with the room behind it (spec §8.1).
const pitch = 0.6;
const lookAt = { y: 0.05, z: -0.1 };
const distanceRange = { min: 3.8, max: 13 };
// How far the camera backs off from the closest view that fits, so there's room round the table.
const margin = 0.9;

// What's covering the table: the lobby's cards on the left and right (in pixels).
export interface RoomTableCameraInsets {
  left: number;
  right: number;
}

const clampDistance = (distance: number): number => Math.min(distanceRange.max, Math.max(distanceRange.min, distance));

// The camera never moves on its own (spec D5): it frames the whole table, with room round it, in the
// part of the screen the lobby's cards leave free, backing off on narrow screens and coming closer on
// wide ones. When the free part isn't in the middle, the view is shifted so the table is in the
// middle of what's free.
export const useRoomTableCamera = ({ left, right }: RoomTableCameraInsets): void => {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    const lens = camera as PerspectiveCamera;
    const half = Math.tan((lens.fov * Math.PI) / 360);
    const free = Math.max(160, size.width - left - right);
    const forWidth = reach.width / (half * (free / size.height)) + margin;
    const forDepth = (reach.depth / half) * (0.6 + margin * 0.39);
    const distance = clampDistance(Math.max(forWidth, forDepth));

    lens.position.set(0, lookAt.y + Math.sin(pitch) * distance, lookAt.z + Math.cos(pitch) * distance);
    lens.lookAt(0, lookAt.y, lookAt.z);
    // A shift only: the window onto the view moves, the lens's angle stays the same.
    lens.setViewOffset(size.width, size.height, -(left - right) / 2, 0, size.width, size.height);
    lens.updateProjectionMatrix();
  }, [camera, size.width, size.height, left, right]);
};
