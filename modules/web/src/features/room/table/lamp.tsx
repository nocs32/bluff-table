import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DoubleSide } from 'three';
import { useRootStore } from '../../../stores/use-root-store';
import { furniture, glow } from './palette';
import { useRoomTableLamp } from './use-lamp';
import { useRoomTablePoke } from './use-poke';

// The lamp hanging over the table (spec §8.2): a brass shade with a bright bulb under it, on a rod
// from the ceiling, hung low enough to stay in view on a phone. Poke it and it swings. M1 turns it
// into the saloon's oil lamp, and hangs it where the players across the table stay in view.
export const RoomTableLamp = observer(function RoomTableLamp(): ReactElement {
  const { table } = useRootStore();
  const swing = useRoomTableLamp(table);
  const wiggle = useRoomTablePoke(table.isLampHovered, false, 14);

  return (
    <group position={[0, 2.85, 0.05]} ref={swing}>
      <mesh position={[0, 0.53, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 2.94, 6]} />
        <meshStandardMaterial color={furniture.ink} metalness={0.6} roughness={0.5} />
      </mesh>
      <group position={[0, -1.07, 0]}>
        <group ref={wiggle}>
          <mesh
            onPointerOver={(event) => {
              event.stopPropagation();
              table.hover({ kind: 'lamp' });
            }}
            onPointerOut={() => table.leave({ kind: 'lamp' })}
            onClick={(event) => {
              event.stopPropagation();
              table.pokeLamp();
            }}
          >
            <cylinderGeometry args={[0.13, 0.42, 0.24, 12, 1, true]} />
            <meshStandardMaterial color={furniture.brass} metalness={0.7} roughness={0.35} side={DoubleSide} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.06, 0.14, 0.05, 12]} />
            <meshStandardMaterial color={furniture.brass} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.07, 16, 12]} />
            <meshBasicMaterial color={glow.bulb} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
});
