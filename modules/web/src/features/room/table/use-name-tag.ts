import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import { Spring } from '../../../utils/spring';

// How much taller a name tag stands on its owner's turn.
const lift = { scale: 0.35, rise: 0.04 } as const;

// A name tag on its owner's turn (spec D22), every frame: it springs up taller, and settles back down
// when the turn moves on.
export const useRoomTableNameTag = (lifted: boolean): RefObject<Group | null> => {
  const ref = useRef<Group>(null);
  const spring = useRef(new Spring(0, 120, 11));

  useFrame((_, dt) => {
    spring.current.target = lifted ? 1 : 0;
    spring.current.step(dt);

    const group = ref.current;

    if (!group) return;

    group.scale.setScalar(1 + spring.current.value * lift.scale);
    group.position.y = spring.current.value * lift.rise;
  });

  return ref;
};
