import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundBill, RoomRoundBillText, RoomRoundBillTitle, RoomRoundGhostCards, RoomRoundGhostHand, RoomRoundGhostHands, RoomRoundGhostName } from './styled-components';

// Once you're a ghost (spec §5.7): every living player's hand, face up. Joined mid-game, you watch
// and see no hands at all (spec §4.5).
export const RoomRoundGhost = observer(function RoomRoundGhost(): ReactElement | null {
  const { locale, room } = useRootStore();
  const { secrets, match } = room.game;

  if (match.isSpectator) {
    return (
      <RoomRoundBill>
        <RoomRoundBillTitle>{locale.t('round.spectator.title')}</RoomRoundBillTitle>
        <RoomRoundBillText>{locale.t('round.spectator.line')}</RoomRoundBillText>
      </RoomRoundBill>
    );
  }

  if (!secrets.isGhost) return null;

  return (
    <RoomRoundBill>
      <RoomRoundBillTitle>{locale.t('round.ghost.title')}</RoomRoundBillTitle>
      <RoomRoundBillText>{secrets.ghostLine}</RoomRoundBillText>
      <RoomRoundGhostHands>
        {secrets.ghostHands.map((hand) => (
          <RoomRoundGhostHand key={hand.id}>
            <RoomRoundGhostName>{hand.name}</RoomRoundGhostName>
            <RoomRoundGhostCards>
              {hand.cards.map((card) => (
                <img key={card.id} src={card.image} alt={card.label} title={card.label} />
              ))}
            </RoomRoundGhostCards>
          </RoomRoundGhostHand>
        ))}
      </RoomRoundGhostHands>
    </RoomRoundBill>
  );
});
