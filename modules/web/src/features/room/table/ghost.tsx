import type { ReactElement } from 'react';
import type { Occupant } from '../../../stores/room/seats';
import type { HeadAim } from './use-head';
import { RoomTablePerson } from './person';
import { useRoomTableGhost } from './use-ghost';

interface RoomTableGhostProps {
  occupant: Occupant;
  position: [number, number, number];
  aim: (time: number) => HeadAim;
}

// A dead player's ghost over their chair (spec §5.7): pale blue, see-through, floating; its head
// still follows their pointer and pulls their faces.
export function RoomTableGhost({ occupant, position, aim }: RoomTableGhostProps): ReactElement {
  const ref = useRoomTableGhost();

  return (
    <group position={position}>
      <group ref={ref}>
        <RoomTablePerson character={occupant.character} color={occupant.color} ghost position={[0, 0, 0]} aim={aim} />
      </group>
    </group>
  );
}
