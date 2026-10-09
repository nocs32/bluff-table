import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { PointLight } from 'three';
import type { TableStore } from '../../../stores/table';
import { lampHang } from './layout';

// How far the flame hangs below the lamp's pivot: its light swings that far across the table.
const reach = lampHang.rod + lampHang.flame;

// The lamp's light follows the flame, every frame: when the lamp swings, the pool of light sways
// across the table and the shadows swing with it (spec §8.1).
export const useRoomTableLights = (table: TableStore): RefObject<PointLight | null> => {
  const ref = useRef<PointLight>(null);

  useFrame(() => {
    const light = ref.current;

    if (!light) return;

    light.position.x = lampHang.pivot[0] + Math.sin(table.sway.lamp) * reach;
    light.position.y = lampHang.pivot[1] - Math.cos(table.sway.lamp) * reach;
  });

  return ref;
};
