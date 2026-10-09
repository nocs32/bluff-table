import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomLobbyCharacter } from './character';
import { RoomLobbyDeal } from './deal';
import { RoomLobbyGame } from './game';
import { RoomLobbyNotice } from './notice';
import { RoomLobbyPlayers } from './players';
import { RoomLobbyFoot, RoomLobbyMiddle, RoomLobbyPrompt, RoomLobbyRoot, RoomLobbySide } from './styled-components';
import { useRoomLobbyInsets } from './use-insets';

// While people gather (spec §4.2, §9.1): who's at the table on the left; your character and the
// game's settings on the right; and between them the saloon, with a notice at the top when something
// changed by itself, and at the bottom a line saying what to try while you wait and Deal the cards.
// On a phone held sideways the cards share one column beside the saloon, and the line moves up over
// the wall, so the table stays in view (spec §9.5).
export const RoomLobby = observer(function RoomLobby(): ReactElement {
  const { locale, table, ui } = useRootStore();
  const { isCompact } = ui.layout;
  const ref = useRoomLobbyInsets(table, isCompact);

  return (
    <RoomLobbyRoot ref={ref} compact={isCompact}>
      {!isCompact && (
        <RoomLobbySide side="left" data-side="left">
          <RoomLobbyPlayers />
        </RoomLobbySide>
      )}
      <RoomLobbyMiddle compact={isCompact}>
        <RoomLobbyNotice />
        {isCompact && table.lampPoke.count === 0 && <RoomLobbyPrompt>{locale.t('table.lampPrompt')}</RoomLobbyPrompt>}
        <RoomLobbyFoot data-foot>
          {!isCompact && table.lampPoke.count === 0 && <RoomLobbyPrompt>{locale.t('table.lampPrompt')}</RoomLobbyPrompt>}
          <RoomLobbyDeal />
        </RoomLobbyFoot>
      </RoomLobbyMiddle>
      <RoomLobbySide side="right" data-side="right">
        {isCompact && <RoomLobbyPlayers />}
        <RoomLobbyCharacter />
        <RoomLobbyGame />
      </RoomLobbySide>
    </RoomLobbyRoot>
  );
});
