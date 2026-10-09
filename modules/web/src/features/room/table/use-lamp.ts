import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import type { TableStore } from '../../../stores/table';
import { Spring } from '../../../utils/spring';

// The hanging lamp, every frame: it sways a little on its own and swings when poked (spec §8.1),
// like a pendulum on its long rod. Its light follows it across the table.
export const useRoomTableLamp = (table: TableStore): RefObject<Group | null> => {
  const ref = useRef<Group>(null);
  const swing = useRef(new Spring(0, 3.2, 0.2));
  const seen = useRef(table.lampPoke.count);

  useFrame(({ clock }, dt) => {
    const { count } = table.lampPoke;

    if (count !== seen.current) swing.current.velocity += 0.3;

    seen.current = count;
    swing.current.step(dt);
    table.sway.lamp = swing.current.value + Math.sin(clock.elapsedTime * 0.9) * 0.008;

    if (!ref.current) return;

    ref.current.rotation.z = table.sway.lamp;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.6) * 0.005;
  });

  return ref;
};
