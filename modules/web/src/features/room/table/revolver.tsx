import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { RevolverView } from '../../../stores/room/seats';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { useRoomTablePoke } from './use-poke';
import { useRoomTableRevolverSpot } from './use-revolver';
import { useCylinderTexture, useRevolverTexture } from './use-textures';

interface RoomTableRevolverProps {
  view: RevolverView;
}

// Someone's own revolver on the felt in front of them (spec D15). Point at it and it says how many
// chambers are left and the odds of the next pull (spec D22). Everyone else's cylinder is printed
// on their name tag; yours lies here by your gun: brass for the chambers still to pull, black for
// the ones pulled.
export const RoomTableRevolver = observer(function RoomTableRevolver({ view }: RoomTableRevolverProps): ReactElement {
  const { table } = useRootStore();
  const gun = useRevolverTexture();
  const cylinder = useCylinderTexture(view.left);
  const spot = useRoomTableRevolverSpot(view.angle);
  const hovered = table.isRevolverHovered(view.id);
  const gunRef = useRoomTablePoke(hovered, false, Infinity);
  const cylinderRef = useRoomTablePoke(hovered, false, Infinity);
  const target = { kind: 'revolver', id: view.id, hint: view.hint } as const;

  return (
    <group>
      <group position={spot.gun} rotation-y={spot.turn}>
        <group ref={gunRef}>
          <RoomTableCutout texture={gun} width={0.42} flat shadow onPointerOver={() => table.hover(target)} onPointerOut={() => table.leave(target)} />
        </group>
      </group>
      {view.isMine && (
        <group position={spot.cylinder} rotation-y={spot.turn}>
          <group ref={cylinderRef}>
            <RoomTableCutout texture={cylinder} width={0.2} flat shadow onPointerOver={() => table.hover(target)} onPointerOut={() => table.leave(target)} />
          </group>
        </group>
      )}
    </group>
  );
});
