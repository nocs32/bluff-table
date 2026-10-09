import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { PlaceView } from '../../../stores/room/seats';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { RoomTableNameTag } from './name-tag';
import { RoomTablePerson } from './person';
import { useRoomTablePlace } from './use-place';
import { useRoomTableSeatAim } from './use-seat-aim';
import { useChairTexture } from './use-textures';

interface RoomTablePlaceProps {
  place: PlaceView;
}

// One place across the table (spec §9.2): a chair, whoever sits in it, and their name tag on the
// felt. A free chair in the lobby can be clicked to sit a bot in it, and says so (spec D22).
export const RoomTablePlace = observer(function RoomTablePlace({ place }: RoomTablePlaceProps): ReactElement {
  const { room, table } = useRootStore();
  const { player } = place;
  const chair = useChairTexture();
  const spot = useRoomTablePlace(place.angle);
  const aim = useRoomTableSeatAim({ heads: room.heads, memberId: player?.id ?? '', angle: place.angle, memberIds: room.presence.ids, meId: room.presence.meId });
  const free = !player && room.seats.canAddBot;

  return (
    <group>
      <RoomTableCutout
        texture={chair}
        width={0.86}
        anchor="bottom"
        position={spot.chair}
        shadow
        onPointerOver={free ? () => table.hover({ kind: 'chair' }) : undefined}
        onPointerOut={free ? () => table.leave({ kind: 'chair' }) : undefined}
        onClick={free ? room.seats.addBot : undefined}
      />
      {player && <RoomTablePerson character={player.character} color={player.color} position={spot.person} aim={aim} />}
      {player && <RoomTableNameTag name={player.name} color={player.color} position={spot.tag} />}
    </group>
  );
});
