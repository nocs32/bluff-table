import type { PlayerColor } from '@bluff-table/protocol';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { RevolverView } from '../../../stores/room/seats';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { useNameTagTexture } from './use-textures';

interface RoomTableNameTagProps {
  name: string;
  color: PlayerColor;
  revolver: RevolverView;
  position: [number, number, number];
}

// A place's name tag standing on the felt, in the player's colour (spec §8.2), with their
// revolver's cylinder printed at the end: point at it and it says how many chambers are left and
// the odds of the next pull (spec D22).
export const RoomTableNameTag = observer(function RoomTableNameTag({ name, color, revolver, position }: RoomTableNameTagProps): ReactElement {
  const { table } = useRootStore();
  const texture = useNameTagTexture(name, color, revolver.left, table.fontsReady);
  const target = { kind: 'revolver', id: revolver.id, hint: revolver.hint } as const;

  return <RoomTableCutout texture={texture} width={0.64} anchor="bottom" position={position} shadow onPointerOver={() => table.hover(target)} onPointerOut={() => table.leave(target)} />;
});
