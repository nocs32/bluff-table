import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { RoomTableCutout } from './cutout';
import { useRoomTableRevealCard, type RevealCardProps } from './use-reveal-card';

// One called card standing up to be read: its back, then, as it flips, its face; a red edge if it
// was a lie.
export const RoomTableRevealCard = observer(function RoomTableRevealCard(props: RevealCardProps): ReactElement {
  const { ref, position, texture } = useRoomTableRevealCard(props);

  return (
    <group position={position} rotation-x={-0.35}>
      <group ref={ref}>
        <RoomTableCutout texture={texture} width={0.3} anchor="bottom" shadow />
      </group>
    </group>
  );
});
