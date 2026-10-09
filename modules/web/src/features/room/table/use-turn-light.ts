import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import { Object3D, type SpotLight } from 'three';
import type { RoomGameMatchStore } from '../../../stores/room/game/match';
import type { TableStore } from '../../../stores/table';
import { Spring } from '../../../utils/spring';
import { feltOval, seatPoint, type StagePoint } from './layout';
import { lightsOn } from './use-lights';

// The spotlight's full brightness.
export const spotIntensity = 34;

export interface RoomTableTurnLight {
  light: RefObject<SpotLight | null>;
  target: Object3D;
}

// Where the light falls for the place at `angle`: on the person and their name tag, or for you, on
// the felt in front of you.
const spotOf = (angle: number): StagePoint => {
  if (angle === 0) return { x: 0, z: feltOval.rz + 0.1 };

  const seat = seatPoint(angle);

  return { x: seat.x * 0.94, z: seat.z * 0.94 };
};

// Whose turn it is, every frame (spec D22): a warm spotlight from above the lamp on whoever's turn it
// is, gliding round the table as the turn passes, while the lamp steps back a little. It's off for
// the reveal and the gun, which have their own drama.
export const useRoomTableTurnLight = (table: TableStore, match: RoomGameMatchStore, layout: () => Map<string, number>): RoomTableTurnLight => {
  const light = useRef<SpotLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const springs = useRef({ x: new Spring(0, 34, 12), z: new Spring(0, 34, 12), level: new Spring(0, 26, 10) });

  useFrame((_, dt) => {
    const round = match.round;
    const angle = round?.step === 'turn' ? layout().get(round.turn) : undefined;
    const { x, z, level } = springs.current;

    if (angle !== undefined) {
      const spot = spotOf(angle);

      if (level.value < 0.05) [x, z].forEach((spring, at) => spring.snap(at === 0 ? spot.x : spot.z));

      x.target = spot.x;
      z.target = spot.z;
    }

    level.target = angle === undefined ? 0 : 1;
    [x, z, level].forEach((spring) => spring.step(dt));
    table.drama.spot = Math.max(0, Math.min(1, level.value));
    target.position.set(x.value, 0.3, z.value);
    target.updateMatrixWorld();
    light.current?.position.set(x.value * 0.45, 3.1, z.value * 0.45 + 0.9);

    if (light.current) light.current.intensity = spotIntensity * table.drama.spot * lightsOn(table.drama.blackout);
  });

  return { light, target };
};
