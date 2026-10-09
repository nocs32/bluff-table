import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import type { TableStore } from '../../../stores/table';
import { Spring } from '../../../utils/spring';

// The hanging lamp, every frame: it sways a little on its own and swings when poked (spec §8.1).
// Its light follows it across the table.
export const useRoomTableLamp = (table: TableStore): RefObject<Group | null> => {
  const ref = useRef<Group>(null);
  const swing = useRef(new Spring(0, 9, 0.35));
  const seen = useRef(table.lampPoke.count);

  useFrame(({ clock }, dt) => {
    const { count } = table.lampPoke;

    if (count !== seen.current) swing.current.velocity += 0.45;

    seen.current = count;
    swing.current.step(dt);
    table.sway.lamp = swing.current.value + Math.sin(clock.elapsedTime * 0.7) * 0.012;

    if (!ref.current) return;

    ref.current.rotation.z = table.sway.lamp;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.008;
  });

  return ref;
};
