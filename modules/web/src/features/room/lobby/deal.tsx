import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomLobbyDealHint, RoomLobbyDealRoot, RoomLobbyDealRules, RoomLobbyDealText } from './styled-components';

// Deal the cards (spec §4.2, §9.1): anyone can, once two seats are filled, and it says what it does
// or what it's waiting for. Next to it, the rules for anyone new (spec D22, D23).
export const RoomLobbyDeal = observer(function RoomLobbyDeal(): ReactElement {
  const { locale, room } = useRootStore();
  const { game } = room;

  return (
    <RoomLobbyDealRoot>
      <Button tone="primary" size="lg" type="button" disabled={!game.canDeal} onClick={game.deal}>
        {locale.t('lobby.deal')}
      </Button>
      <RoomLobbyDealText>
        <RoomLobbyDealHint>{game.dealHint}</RoomLobbyDealHint>
        <RoomLobbyDealRules type="button" onClick={game.openRules}>
          {locale.t('lobby.newHere')}
        </RoomLobbyDealRules>
      </RoomLobbyDealText>
    </RoomLobbyDealRoot>
  );
});
