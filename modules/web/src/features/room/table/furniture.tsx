import type { ReactElement } from 'react';
import { DoubleSide } from 'three';
import { RoomTableCutout } from './cutout';
import { stage, tableBase, tableTop } from './layout';
import { useApronTexture, useFloorShadowTexture, useTableLegTexture, useTableTexture } from './use-textures';

const { table, floorY } = stage;

// The card table (spec §8.2): the felt in its wooden rim, a card cut-out lying flat under the lamp,
// on a wooden apron and turned legs down to the floor, with its shadow under it. What lies on it is
// in middle.tsx and revolvers.tsx.
export function RoomTableFurniture(): ReactElement {
  const top = useTableTexture();
  const apron = useApronTexture();
  const leg = useTableLegTexture();
  const shadow = useFloorShadowTexture();

  return (
    <group>
      <RoomTableCutout texture={top} width={tableTop.width} flat />
      <mesh position-y={-tableBase.apron / 2 - 0.002} scale={[table.rx, 1, table.rz]}>
        <cylinderGeometry args={[1, 1, tableBase.apron, 128, 1, true]} />
        <meshStandardMaterial map={apron} emissiveMap={apron} emissive="white" emissiveIntensity={0.8} roughness={0.85} side={DoubleSide} />
      </mesh>
      {tableBase.legs.map(([x, z]) => (
        <RoomTableCutout key={`${x},${z}`} texture={leg} width={tableBase.legWidth} anchor="bottom" position={[x, floorY, z]} />
      ))}
      <mesh rotation-x={-Math.PI / 2} position-y={floorY + 0.005} scale={[table.rx * 1.25, table.rz * 1.25, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}
