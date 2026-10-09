import type { TableRank } from '@bluff-table/protocol';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { useRoomTablePoke } from './use-poke';
import { useTableCardStandTexture } from './use-textures';

interface RoomTableStandProps {
  rank: TableRank;
}

// The table card in its brass holder in the middle of the table (spec §8.2), always on show (D22).
// It pops up with each deal; point at it and it says what it means.
export const RoomTableStand = observer(function RoomTableStand({ rank }: RoomTableStandProps): ReactElement {
  const { room, table } = useRootStore();
  const texture = useTableCardStandTexture(rank, table.fontsReady);
  const target = { kind: 'info', id: 'tableCard', hint: room.game.match.tableCardHint } as const;
  const ref = useRoomTablePoke(table.hovered?.kind === 'info' && table.hovered.id === 'tableCard', true, 13);

  return (
    <group key={rank} position={[0, 0, -0.18]}>
      <group ref={ref}>
        <RoomTableCutout texture={texture} width={0.36} anchor="bottom" shadow onPointerOver={() => table.hover(target)} onPointerOut={() => table.leave(target)} />
      </group>
    </group>
  );
});
