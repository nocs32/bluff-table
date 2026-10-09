import { useMemo } from 'react';
import { feltOval } from './layout';

type Point = [number, number, number];

export interface RevolverSpots {
  gun: Point;
  cylinder: Point;
  // How far it's turned round on the felt, so it lies square to its owner.
  turn: number;
}

// How far along the rim, either side of the name tag, the gun and its cylinder lie.
const apart = { gun: 0.52, cylinder: 0.42 };

// Where the revolver at the place at `angle` lies, on the felt in front of its owner and to their
// right, clear of their name tag. Yours lies at the near edge, your cylinder to your left.
export const useRoomTableRevolverSpot = (angle: number): RevolverSpots =>
  useMemo((): RevolverSpots => {
    const radians = (angle * Math.PI) / 180;
    const right = { x: Math.cos(radians), z: Math.sin(radians) };
    const inward = angle === 0 ? 0.72 : 0.8;
    const base = { x: -Math.sin(radians) * feltOval.rx * inward, z: Math.cos(radians) * feltOval.rz * inward };
    const along = (by: number): Point => [base.x + right.x * by, 0.004, base.z + right.z * by];

    return { gun: along(apart.gun), cylinder: along(-apart.cylinder), turn: -radians };
  }, [angle]);
