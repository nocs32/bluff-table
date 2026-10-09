import type { PlayerColor } from '@bluff-table/protocol';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { RevolverView } from '../../../stores/room/seats';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { useRoomTableNameTag } from './use-name-tag';
import { useNameTagTexture } from './use-textures';

interface RoomTableNameTagProps {
  name: string;
  color: PlayerColor;
  revolver: RevolverView;
  position: [number, number, number];
  // It's their turn: the tag stands up taller.
  lifted: boolean;
}

// A place's name tag standing on the felt, in the player's colour (spec §8.2), with their
// revolver's cylinder printed at the end: point at it and it says how many chambers are left and
// the odds of the next pull (spec D22). On their turn it stands up taller in the spotlight.
export const RoomTableNameTag = observer(function RoomTableNameTag({ name, color, revolver, position, lifted }: RoomTableNameTagProps): ReactElement {
  const { table } = useRootStore();
  const texture = useNameTagTexture(name, color, revolver.left, table.fontsReady);
  const target = { kind: 'revolver', id: revolver.id, hint: revolver.hint } as const;
  const ref = useRoomTableNameTag(lifted);

  return (
    <group ref={ref} position={position}>
      <RoomTableCutout texture={texture} width={0.64} anchor="bottom" shadow onPointerOver={() => table.hover(target)} onPointerOut={() => table.leave(target)} />
    </group>
  );
});
