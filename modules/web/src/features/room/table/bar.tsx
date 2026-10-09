import type { ReactElement } from 'react';
import { RoomTableBarkeep } from './barkeep';
import { RoomTableCutout } from './cutout';
import { counterTop, stage } from './layout';
import { useBackBarTexture, useCounterTexture } from './use-textures';

const { bar, wall, floorY } = stage;

// The bar at the back (spec §8.2): shelves of bottles on the wall, the counter, and the barkeep
// polishing a glass behind it.
export function RoomTableBar(): ReactElement {
  const shelves = useBackBarTexture();
  const counter = useCounterTexture();

  return (
    <group>
      <RoomTableCutout texture={shelves} width={3.6} anchor="bottom" position={[bar.x, floorY + 1.7, wall.z + 0.02]} />
      <RoomTableBarkeep />
      <RoomTableCutout texture={counter} width={4.1} anchor="top" position={[bar.x, counterTop + 0.04, bar.counterZ]} shadow />
    </group>
  );
}
