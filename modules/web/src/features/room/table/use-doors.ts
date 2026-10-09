import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import { Spring } from '../../../utils/spring';

export interface DoorLeaves {
  left: RefObject<Group | null>;
  right: RefObject<Group | null>;
}

// The swinging doors, every frame (spec §8.2): when someone sits down at the table, they swing open
// as if someone walked in, and flap shut on a loose spring.
export const useRoomTableDoors = (people: number): DoorLeaves => {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const swing = useRef(new Spring(0, 30, 2.2));
  const seen = useRef(people);

  useFrame((_, dt) => {
    if (people > seen.current) swing.current.velocity += 7;

    seen.current = people;
    swing.current.step(dt);

    // They swing out into the room, and only a little the other way: the wall is right behind them.
    const angle = Math.max(-0.15, Math.min(1.2, swing.current.value));

    if (left.current) left.current.rotation.y = -angle;

    if (right.current) right.current.rotation.y = angle;
  });

  return { left, right };
};
