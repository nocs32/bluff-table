import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { RoomGameMatchStore } from '../../../stores/room/game/match';
import type { TableStore } from '../../../stores/table';
import { Spring } from '../../../utils/spring';
import { seatPoint } from './layout';

// The pull's drama, every frame (spec §8.4): when someone has the gun out, the room dims (more
// once they press) and the camera pushes in on them; after a bang the lights come back on and the
// jolt dies away. The camera and the lights read it from `table.drama`.
export const useRoomTableDrama = (table: TableStore, match: RoomGameMatchStore, layout: () => Map<string, number>): void => {
  const dim = useRef(new Spring(0, 30, 11));
  const push = useRef(new Spring(0, 12, 7));

  useFrame((_, dt) => {
    const { drama } = table;
    const round = match.round;
    const puller = round?.puller?.seat ?? null;
    const tense = puller !== null && (round?.step === 'pull' || round?.step === 'pulling');
    const angle = puller === null ? undefined : layout().get(puller);

    dim.current.target = tense ? (round?.step === 'pulling' ? 1 : 0.6) : 0;
    push.current.target = tense ? 1 : 0;
    dim.current.step(dt);
    push.current.step(dt);

    if (tense && angle !== undefined) {
      const point = seatPoint(angle);

      drama.focus = angle === 0 ? { x: 0, z: 0 } : { x: point.x, z: point.z };
    }

    drama.dim = Math.max(0, dim.current.value);
    drama.push = Math.max(0, push.current.value);
    drama.blackout = Math.max(0, drama.blackout - dt * 1.1);
    drama.jolt = Math.max(0, drama.jolt - dt * 2.2);
  });
};
