import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { PlaceView } from '../../../stores/room/seats';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { RoomTableGhost } from './ghost';
import { RoomTableMarks } from './marks';
import { RoomTableNameTag } from './name-tag';
import { RoomTablePerson } from './person';
import { useRoomTablePlace } from './use-place';
import { useRoomTablePlaceAims } from './use-place-aims';
import { useChairTexture } from './use-textures';

interface RoomTablePlaceProps {
  place: PlaceView;
}

// One place across the table (spec §9.2): a chair, whoever sits in it (slumped on the felt with
// their ghost over the chair once they're dead), their name tag on the felt with their cylinder on
// it, and the marks of the round. A free chair in the lobby can be clicked to sit a bot in it, and
// says so (spec D22).
export const RoomTablePlace = observer(function RoomTablePlace({ place }: RoomTablePlaceProps): ReactElement {
  const { room, table } = useRootStore();
  const { player, seat } = place;
  const chair = useChairTexture();
  const spots = useRoomTablePlace(place.angle);
  const aims = useRoomTablePlaceAims(place);
  const free = !player && room.seats.canAddBot;
  const revolver = player ? room.seats.revolverOf(player.id) : null;

  return (
    <group>
      <RoomTableCutout
        texture={chair}
        width={0.86}
        anchor="bottom"
        position={spots.chair}
        shadow
        onPointerOver={free ? () => table.hover({ kind: 'chair' }) : undefined}
        onPointerOut={free ? () => table.leave({ kind: 'chair' }) : undefined}
        onClick={free ? room.seats.addBot : undefined}
      />
      {player && <RoomTablePerson character={player.character} color={player.color} dead={seat !== null && !seat.alive} position={spots.person} aim={aims.person} />}
      {player && seat && !seat.alive && <RoomTableGhost occupant={player} position={spots.ghost} aim={aims.ghost} />}
      {player && revolver && <RoomTableNameTag name={player.tag} color={player.color} revolver={revolver} position={spots.tag} />}
      {player && <RoomTableMarks occupant={player} spots={spots} />}
    </group>
  );
});
