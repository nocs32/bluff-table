import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { PointLight } from 'three';
import type { TableStore } from '../../../stores/table';
import { lampHang } from './layout';

// How far the flame hangs below the lamp's pivot: its light swings that far across the table.
const reach = lampHang.rod + lampHang.flame;

// The lamp's full brightness.
export const lampIntensity = 16;

// After a bang the lights are out for a split second, then flicker back on (spec §8.4): 1 is fully
// on, 0 out. `blackout` runs from 1 down to 0 over about a second.
export const lightsOn = (blackout: number): number => {
  if (blackout > 0.72) return 0;

  return blackout > 0.45 ? 0.35 + 0.65 * Math.abs(Math.sin(blackout * 60)) : 1;
};

// The lamp's light follows the flame, every frame: when the lamp swings, the pool of light sways
// across the table and the shadows swing with it (spec §8.1). It dims for a pull and flares on a
// bang (spec §8.4).
export const useRoomTableLights = (table: TableStore): RefObject<PointLight | null> => {
  const ref = useRef<PointLight>(null);

  useFrame(() => {
    const light = ref.current;

    if (!light) return;

    light.position.x = lampHang.pivot[0] + Math.sin(table.sway.lamp) * reach;
    light.position.y = lampHang.pivot[1] - Math.cos(table.sway.lamp) * reach;
    light.intensity = lampIntensity * (1 - table.drama.dim * 0.6) * lightsOn(table.drama.blackout);
  });

  return ref;
};
