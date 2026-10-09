import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Light } from 'three';
import type { TableStore } from '../../../stores/table';
import { lightsOn } from './use-lights';

// The room's other lights (the lamps over the bar and by the doors, the glow everywhere), every
// frame: they dim less than the table's lamp while someone has the gun out, and go out with it after
// a bang (spec §8.4). `levels` are their full brightness, in order; each light takes its ref from
// the list this returns.
export const useRoomTableRoomLights = (table: TableStore, levels: readonly number[]): Array<(light: Light | null) => void> => {
  const lights = useRef<Array<Light | null>>([]);

  useFrame(() => {
    const scale = (1 - table.drama.dim * 0.4) * lightsOn(table.drama.blackout);

    lights.current.forEach((light, index) => {
      if (light) light.intensity = (levels[index] ?? 0) * scale;
    });
  });

  return useMemo(
    () =>
      levels.map((_, index) => (light: Light | null) => {
        lights.current[index] = light;
      }),
    [levels],
  );
};
