import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import { NeutralToneMapping, Vector3, type PerspectiveCamera } from 'three';
import type { TableDrama, TableInsets } from '../../../stores/table';
import { stage } from './layout';

const { camera: view } = stage;
// How far the scene reaches round the camera's target that must stay in view: the places across
// the table side to side, and the table's near edge to the lamp up and down.
const reach = { width: 2.25, height: 1.75 };
const distanceRange = { min: 4.2, max: 12 };

const clampDistance = (distance: number): number => Math.min(distanceRange.max, Math.max(distanceRange.min, distance));

// How far a push-in on the pull goes: a share of the way from where the camera stands towards the
// one pulling, and how far the view turns to them.
const pushIn = { travel: 0.22, turn: 0.45 };

// Where the camera stands and looks, set by the framing; the drama moves it from there.
interface CameraBase {
  position: Vector3;
  target: Vector3;
}

// Every frame: the push-in on whoever's pulling, and the jolt of a bang (spec §8.4).
const useDrama = (camera: PerspectiveCamera, base: CameraBase, drama: TableDrama): void => {
  const focus = useRef(new Vector3());
  const look = useRef(new Vector3());

  useFrame(({ clock }) => {
    focus.current.set(drama.focus.x, base.target.y - 0.1, drama.focus.z);
    camera.position.copy(base.position).lerp(focus.current, drama.push * pushIn.travel);
    look.current.copy(base.target).lerp(focus.current, drama.push * pushIn.turn);

    if (drama.jolt > 0) camera.position.y += Math.sin(clock.elapsedTime * 70) * drama.jolt * 0.06;

    camera.lookAt(look.current);
  });
};

// The camera never moves on its own (spec D5): from your seat it looks across the table, a little
// down, and frames the places, the table and the lamp in the part of the screen the lobby leaves
// free, backing off on narrow screens. When the free part isn't in the middle, the view is shifted
// so the table is in the middle of what's free. Only the pull's scripted moments move it.
export const useRoomTableCamera = ({ left, right, bottom }: TableInsets, drama: TableDrama): void => {
  const { camera, size, gl } = useThree();
  const base = useRef<CameraBase>({ position: new Vector3(), target: new Vector3(view.target.x, view.target.y, view.target.z) });

  useDrama(camera as PerspectiveCamera, base.current, drama);

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
    base.current.position.copy(lens.position);
    lens.lookAt(view.target.x, view.target.y, view.target.z);
    // A shift only: the window onto the view moves, the lens's angle stays the same.
    lens.setViewOffset(size.width, size.height, -(left - right) / 2, bottom / 2, size.width, size.height);
    lens.updateProjectionMatrix();
  }, [camera, size.width, size.height, left, right, bottom]);
};
