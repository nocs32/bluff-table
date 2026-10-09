import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundStampRoot, RoomRoundStampWord } from './styled-components';

// Your turn starts (spec D22): "Your turn!" is stamped over the table in red ink for a moment, with
// the chime, so you notice even if you were looking away.
export const RoomRoundStamp = observer(function RoomRoundStamp(): ReactElement | null {
  const { locale, room } = useRootStore();

  if (room.game.turnStamp === 0) return null;

  return (
    <RoomRoundStampRoot key={room.game.turnStamp} aria-hidden>
      <RoomRoundStampWord>{locale.t('round.turn.stamp')}</RoomRoundStampWord>
    </RoomRoundStampRoot>
  );
});
