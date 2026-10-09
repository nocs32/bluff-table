import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomLobbyGame } from './game';
import { RoomLobbyNotice } from './notice';
import { RoomLobbyPlayers } from './players';
import { RoomLobbyPrompt, RoomLobbyRoot, RoomLobbySide } from './styled-components';
import { useRoomLobbyInsets } from './use-insets';

// While people gather (spec §4.2, §9.1): who's at the table on one side, the game's settings on the
// other, and between them the table itself, with a line saying what to poke while you wait, and at
// the top a notice when something changed by itself. On a phone held sideways the cards share one
// column beside the table, so nothing covers it (spec §9.5).
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
      <RoomLobbyNotice />
      {table.lampPoke.count === 0 && <RoomLobbyPrompt compact={isCompact}>{locale.t('table.lampPrompt')}</RoomLobbyPrompt>}
      <RoomLobbySide side="right" data-side="right">
        {isCompact && <RoomLobbyPlayers />}
        <RoomLobbyGame />
      </RoomLobbySide>
    </RoomLobbyRoot>
  );
});
