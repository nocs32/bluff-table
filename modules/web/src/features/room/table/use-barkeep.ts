import type { Character } from '@bluff-table/protocol';
import { useFrame } from '@react-three/fiber';
import { useCallback, useRef, type RefObject } from 'react';
import type { Group } from 'three';
import type { HeadAim } from './use-head';

// The barkeep (spec §8.2): bald, a walrus moustache, an apron over his shirt.
export const barkeepCharacter: Character = { hat: 'none', face: 'walrus', hair: 'bald', scar: 'none', straw: false, hairTone: 'black', coat: 'slate' };

// He keeps an eye on the table, glancing about now and then.
export const useRoomTableBarkeepAim = (): ((time: number) => HeadAim) =>
  useCallback((time: number): HeadAim => ({ x: 0.25 + Math.sin(time * 0.31) * 0.35 + Math.sin(time * 0.83) * 0.12, y: -0.25 + Math.sin(time * 0.47) * 0.12, mood: 'idle' }), []);

// The glass he polishes, going round and round in front of his chest.
export const useRoomTablePolishing = (): RefObject<Group | null> => {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    const group = ref.current;

    if (!group) return;

    group.position.x = Math.cos(clock.elapsedTime * 2.6) * 0.025;
    group.position.y = Math.sin(clock.elapsedTime * 2.6) * 0.012;
  });

  return ref;
};
