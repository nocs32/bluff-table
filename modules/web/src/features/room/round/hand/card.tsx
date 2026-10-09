import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { HandCardView } from '../../../../stores/room/game/hand';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRoundHandCardButton, RoomRoundHandCardItem, RoomRoundHandTruthful } from './styled-components';

interface RoomRoundHandCardProps {
  card: HandCardView;
}

// One of your cards: click to pick it (up to three), again to put it back. A brass check marks the
// ones that tell the truth this round (spec D22), and its tooltip says why.
export const RoomRoundHandCard = observer(function RoomRoundHandCard({ card }: RoomRoundHandCardProps): ReactElement {
  const { locale, room } = useRootStore();
  const { hand } = room.game;

  return (
    <RoomRoundHandCardItem>
      <RoomRoundHandCardButton type="button" aria-pressed={card.picked} disabled={!hand.canPick} title={card.hint} onClick={() => hand.toggle(card.id)}>
        <img src={card.image} alt={card.hint} draggable={false} />
        {card.truthful && <RoomRoundHandTruthful aria-label={locale.t('round.hand.truthful')}>✓</RoomRoundHandTruthful>}
      </RoomRoundHandCardButton>
    </RoomRoundHandCardItem>
  );
});
