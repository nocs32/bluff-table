import type { RoundSnapshot } from '@bluff-table/protocol';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTablePileCard } from './pile-card';
import { useRoomTablePile } from './use-pile';
import { useCardTexture } from './use-textures';

interface RoomTablePileProps {
  round: RoundSnapshot;
}

// The pile of face-down plays in the middle of the table (spec §9.2): every play this round, each
// card thrown in from its player's place. Nobody sees their faces until a call flips them.
export const RoomTablePile = observer(function RoomTablePile({ round }: RoomTablePileProps): ReactElement {
  const { room, table } = useRootStore();
  const back = useCardTexture(null, false, table.fontsReady);
  const spots = useRoomTablePile(round.plays, round.flipped, room.seats.layout);

  return (
    <group>
      {spots.map((spot) => (
        <RoomTablePileCard key={spot.key} spot={spot} texture={back} />
      ))}
    </group>
  );
});
