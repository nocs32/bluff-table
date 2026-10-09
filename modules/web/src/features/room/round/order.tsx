import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundOrderSeat } from './order-seat';
import { RoomRoundOrderRoot } from './styled-components';

// The turn order (spec D22): everyone's face in the order the turn goes round, starting with you;
// whoever's move it is now stands out, and the next one is marked, so you see how far off yours is.
export const RoomRoundOrder = observer(function RoomRoundOrder(): ReactElement | null {
  const { locale, room } = useRootStore();
  const { order } = room.game;

  if (!order.isShown) return null;

  return (
    <RoomRoundOrderRoot aria-label={locale.t('round.order.label')}>
      {order.seats.map((seat) => (
        <RoomRoundOrderSeat key={seat.id} seat={seat} />
      ))}
    </RoomRoundOrderRoot>
  );
});
