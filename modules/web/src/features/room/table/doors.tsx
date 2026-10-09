import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { doorLeaf, stage } from './layout';
import { useRoomTableDoors } from './use-doors';
import { useDoorLeafTexture, useDoorwayTexture } from './use-textures';

const { doors, wall, floorY } = stage;

// The swinging doors onto the night (spec §8.2). They swing open whenever someone sits down.
export const RoomTableDoors = observer(function RoomTableDoors(): ReactElement {
  const { presence } = useRootStore().room;
  const doorway = useDoorwayTexture();
  const leaf = useDoorLeafTexture();
  const leaves = useRoomTableDoors(presence.count);

  return (
    <group position={[doors.x, floorY, wall.z + 0.05]}>
      <RoomTableCutout texture={doorway} width={doors.width} anchor="bottom" />
      <group position={[-doorLeaf.hinge, doorLeaf.bottom, 0.12]} ref={leaves.left}>
        <RoomTableCutout texture={leaf} width={doorLeaf.width} anchor="bottom" position={[doorLeaf.width / 2, 0, 0]} shadow />
      </group>
      <group position={[doorLeaf.hinge, doorLeaf.bottom, 0.12]} ref={leaves.right}>
        <group scale-x={-1}>
          <RoomTableCutout texture={leaf} width={doorLeaf.width} anchor="bottom" position={[doorLeaf.width / 2, 0, 0]} shadow />
        </group>
      </group>
    </group>
  );
});
