import type { ReactElement } from 'react';
import { DoubleSide } from 'three';
import { RoomTableCutout } from './cutout';
import { stage, tableBase, tableTop } from './layout';
import { useApronTexture, useDeckTexture, useFloorShadowTexture, useRevolverTexture, useTableLegTexture, useTableTexture } from './use-textures';

const { table, floorY } = stage;

// The card table (spec §8.2): the felt in its wooden rim, a card cut-out lying flat under the lamp,
// on a wooden apron and turned legs down to the floor, with its shadow under it; on it the deck,
// squared up for the deal, and the revolver.
export function RoomTableFurniture(): ReactElement {
  const top = useTableTexture();
  const apron = useApronTexture();
  const leg = useTableLegTexture();
  const shadow = useFloorShadowTexture();
  const deck = useDeckTexture();
  const revolver = useRevolverTexture();

  return (
    <group>
      <RoomTableCutout texture={top} width={tableTop.width} flat />
      <mesh position-y={-tableBase.apron / 2 - 0.002} scale={[table.rx, 1, table.rz]}>
        <cylinderGeometry args={[1, 1, tableBase.apron, 128, 1, true]} />
        <meshStandardMaterial map={apron} roughness={0.85} side={DoubleSide} />
      </mesh>
      {tableBase.legs.map(([x, z]) => (
        <RoomTableCutout key={`${x},${z}`} texture={leg} width={tableBase.legWidth} anchor="bottom" position={[x, floorY, z]} />
      ))}
      <mesh rotation-x={-Math.PI / 2} position-y={floorY + 0.005} scale={[table.rx * 1.25, table.rz * 1.25, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
      <RoomTableCutout texture={deck} width={0.36} position={[0.62, 0.004, -0.05]} flat shadow />
      <RoomTableCutout texture={revolver} width={0.7} position={[-0.6, 0.004, 0.15]} flat shadow />
    </group>
  );
}
