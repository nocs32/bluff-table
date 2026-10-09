import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import { Spring } from '../../../utils/spring';

// A ghost, every frame (spec §5.7, §8.4): it rises out of its body after the bang, then floats over
// the chair, bobbing gently.
export const useRoomTableGhost = (): RefObject<Group | null> => {
  const ref = useRef<Group>(null);
  const rise = useRef(new Spring(-0.5, 18, 6));

  rise.current.target = 0;

  useFrame(({ clock }, dt) => {
    const group = ref.current;

    rise.current.step(dt);

    if (!group) return;

    group.position.y = rise.current.value + Math.sin(clock.elapsedTime * 1.6) * 0.035;
    group.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.025;
  });

  return ref;
};
