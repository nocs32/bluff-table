import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { RoomChat } from './chat';
import { RoomDock } from './dock';
import { RoomFlights } from './flights';
import { RoomLobby } from './lobby';
import { RoomRotate } from './rotate';
import { RoomStatus } from './status';
import { RoomMain, RoomRoot } from './styled-components';
import { RoomTable } from './table';
import { RoomTopBar } from './top-bar';
import { useRoomArea } from './use-area';

// The whole page: the top bar, the saloon's table (with the lobby, the floating chat and flying
// emoji over it), and the dock along the bottom. Until the table is open, a status card stands in.
// The rounds and the rule book come in M1 (spec §12).
export const Room = observer(function Room(): ReactElement {
  const { room, ui } = useRootStore();
  const areaRef = useRoomArea(ui.widgets.area);
  const { isCompact } = ui.layout;

  if (!room.isOpen) {
    return (
      <>
        <RoomStatus />
        <RoomRotate />
      </>
    );
  }

  return (
    <RoomRoot>
      <RoomTopBar />
      <RoomMain ref={areaRef}>
        <RoomTable />
        {room.game.isLobby && <RoomLobby />}
        {isCompact && <RoomDock />}
        {ui.widgets.showsChat && <RoomChat />}
        <RoomFlights />
      </RoomMain>
      {!isCompact && <RoomDock />}
      <RoomRotate />
    </RoomRoot>
  );
});
