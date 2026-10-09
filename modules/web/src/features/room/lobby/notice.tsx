import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomLobbyNoticeRoot } from './styled-components';

// One line over the top of the table saying why something changed by itself, such as the graphics
// getting lighter (spec D22). It sits between the lobby's cards, so it never covers them. Click it
// to close it.
export const RoomLobbyNotice = observer(function RoomLobbyNotice(): ReactElement | null {
  const { notice, layout } = useRootStore().ui;

  if (!notice.isShown) return null;

  return (
    <RoomLobbyNoticeRoot role="status" compact={layout.isCompact} onClick={notice.hide}>
      {notice.text}
    </RoomLobbyNoticeRoot>
  );
});
