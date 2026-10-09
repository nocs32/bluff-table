import type { ReactElement } from 'react';
import { RoomRoundGunRingSvg } from './styled-components';
import { useRoomRoundGunRing } from './use-ring';

interface RoomRoundGunRingProps {
  // How much of the gun's ten seconds has gone, 0 to 1.
  spent: number;
}

// The brass ring round Pull the trigger, running down as the seconds go.
export function RoomRoundGunRing({ spent }: RoomRoundGunRingProps): ReactElement {
  const ref = useRoomRoundGunRing(spent);

  return (
    <RoomRoundGunRingSvg ref={ref} viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="45" />
      <circle cx="50" cy="50" r="45" />
    </RoomRoundGunRingSvg>
  );
}
