import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import { Spring } from '../../../utils/spring';

// How a shot body lies: leant forward over the table (radians) and sunk down onto it (metres).
// Any further and the cut-out's drawn side would face the felt.
const slump = { lean: 0.5, sink: 0.24 };

// A person, every frame (spec D20, §8.4): shot, they slump forward across the table with a little
// bounce as they land, and stay there for the rest of the game; back up for the next game.
export const useRoomTableSlump = (dead: boolean): RefObject<Group | null> => {
  const ref = useRef<Group>(null);
  const fall = useRef(new Spring(dead ? 1 : 0, 70, 8));

  fall.current.target = dead ? 1 : 0;

  useFrame((_, dt) => {
    const spring = fall.current;

    if (!spring.isSettled) spring.step(dt);

    if (!ref.current) return;

    ref.current.rotation.x = spring.value * slump.lean;
    ref.current.position.y = -Math.min(1.1, spring.value) * slump.sink;
  });

  return ref;
};
