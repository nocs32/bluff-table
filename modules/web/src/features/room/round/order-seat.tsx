import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { TurnOrderSeat } from '../../../stores/room/game/order';
import { Avatar } from '../../../ui';
import { RoomRoundOrderFace, RoomRoundOrderItem, RoomRoundOrderTag } from './styled-components';

interface RoomRoundOrderSeatProps {
  seat: TurnOrderSeat;
}

// One face in the turn order: bigger with a brass ring when it's their move, faded once they're a
// ghost, with a word under it (You, Now, Next).
export const RoomRoundOrderSeat = observer(function RoomRoundOrderSeat({ seat }: RoomRoundOrderSeatProps): ReactElement {
  return (
    <RoomRoundOrderItem ghost={seat.isGhost} title={seat.title}>
      <RoomRoundOrderFace now={seat.isNow}>
        <Avatar portrait={seat.portrait} color={seat.color} size="md" label={seat.title} />
      </RoomRoundOrderFace>
      <RoomRoundOrderTag tone={seat.isNow ? 'now' : seat.isYou ? 'you' : 'other'}>{seat.tag}</RoomRoundOrderTag>
    </RoomRoundOrderItem>
  );
});
