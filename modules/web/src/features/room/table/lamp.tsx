import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { RoomTableFlame } from './flame';
import { lampHang } from './layout';
import { furniture } from './palette';
import { useRoomTableLamp } from './use-lamp';
import { useRoomTablePoke } from './use-poke';
import { useLampTexture } from './use-textures';

// The oil lamp over the table (spec §8.1, §8.2): a cut-out hanging on a long rod from the ceiling,
// its flame glowing in a halo of warm light. It sways a little all the time; poke it and it swings,
// and its light swings across the table with it.
export const RoomTableLamp = observer(function RoomTableLamp(): ReactElement {
  const { table } = useRootStore();
  const swing = useRoomTableLamp(table);
  const wiggle = useRoomTablePoke(table.isLampHovered, false, 14);
  const texture = useLampTexture();

  return (
    <group position={lampHang.pivot} ref={swing}>
      <mesh position-y={-lampHang.rod / 2}>
        <cylinderGeometry args={[0.008, 0.008, lampHang.rod, 6]} />
        <meshBasicMaterial color={furniture.ink} />
      </mesh>
      <group position-y={-lampHang.rod}>
        <group ref={wiggle}>
          <RoomTableCutout
            texture={texture}
            width={lampHang.width}
            anchor="top"
            unlit
            onPointerOver={(event) => {
              event.stopPropagation();
              table.hover({ kind: 'lamp' });
            }}
            onPointerOut={() => table.leave({ kind: 'lamp' })}
            onClick={(event) => {
              event.stopPropagation();
              table.pokeLamp();
            }}
          />
          <RoomTableFlame />
        </group>
      </group>
    </group>
  );
});
