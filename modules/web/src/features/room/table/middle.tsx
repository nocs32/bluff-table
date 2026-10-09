import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { RoomTablePile } from './pile';
import { RoomTableReveal } from './reveal';
import { RoomTableStand } from './stand';
import { useDeckTexture } from './use-textures';

// The middle of the table (spec §9.2): in the lobby the deck, squared up for the deal; in a round
// the table card on its stand, the pile of face-down plays, and the called cards flipping.
export const RoomTableMiddle = observer(function RoomTableMiddle(): ReactElement {
  const { room } = useRootStore();
  const deck = useDeckTexture();
  const round = room.game.match.round;

  if (!round || room.game.isLobby) return <RoomTableCutout texture={deck} width={0.36} position={[0, 0.004, 0.05]} flat shadow />;

  return (
    <group>
      <RoomTableStand rank={round.tableRank} />
      <RoomTablePile round={round} />
      <RoomTableReveal round={round} />
    </group>
  );
});
