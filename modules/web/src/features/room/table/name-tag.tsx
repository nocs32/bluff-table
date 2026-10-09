import type { PlayerColor } from '@bluff-table/protocol';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { useNameTagTexture } from './use-textures';

interface RoomTableNameTagProps {
  name: string;
  color: PlayerColor;
  position: [number, number, number];
}

// A place's name tag standing on the felt, in the player's colour (spec §8.2).
export const RoomTableNameTag = observer(function RoomTableNameTag({ name, color, position }: RoomTableNameTagProps): ReactElement {
  const { table } = useRootStore();
  const texture = useNameTagTexture(name, color, table.fontsReady);

  return <RoomTableCutout texture={texture} width={0.5} anchor="bottom" position={position} shadow />;
});
