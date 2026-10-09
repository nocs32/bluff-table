import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRoundHandActions } from './actions';
import { RoomRoundHandCard } from './card';
import { RoomRoundHandCards, RoomRoundHandRoot } from './styled-components';

// Your hand along the bottom (spec §9.2) and your buttons beside it.
export const RoomRoundHand = observer(function RoomRoundHand(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <RoomRoundHandRoot>
      <RoomRoundHandCards data-cards aria-label={locale.t('round.hand.label')}>
        {room.game.hand.cards.map((card) => (
          <RoomRoundHandCard key={card.id} card={card} />
        ))}
      </RoomRoundHandCards>
      <RoomRoundHandActions />
    </RoomRoundHandRoot>
  );
});
