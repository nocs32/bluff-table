import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { Group } from 'three';
import { Spring } from '../../../utils/spring';
import type { PileCardSpot } from './use-pile';

// A card being played, every frame: it slides from its player's place onto the pile in a low arc,
// turning as it goes, and lands with a slap (spec §9.2).
export const useRoomTablePileCard = ({ to, turn, from }: PileCardSpot): RefObject<Group | null> => {
  const ref = useRef<Group>(null);
  const travel = useRef(new Spring(0, 90, 15));

  travel.current.target = 1;

  useFrame((_, dt) => {
    const group = ref.current;
    const spring = travel.current;

    if (!group) return;

    if (!spring.isSettled) spring.step(dt);

    const t = Math.min(1.05, spring.value);

    group.position.set(from[0] + (to[0] - from[0]) * t, to[1] + Math.sin(Math.min(1, t) * Math.PI) * 0.18 + (from[1] - to[1]) * Math.max(0, 1 - t) * 0.2, from[2] + (to[2] - from[2]) * t);
    group.rotation.y = turn * t + (1 - t) * 0.8;
  });

  return ref;
};
