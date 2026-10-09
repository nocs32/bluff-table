import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRoundHandDoubleButton, RoomRoundHandDoubleFill, RoomRoundHandDoubleLabel, RoomRoundHandHint } from './styled-components';

// Liar! ×2 (spec §5.9): made to feel dangerous. Hold it down for a second while it fills and the
// screen reddens; let go early and nothing happens.
export const RoomRoundHandDouble = observer(function RoomRoundHandDouble(): ReactElement {
  const { locale, room } = useRootStore();
  const { turn } = room.game;

  return (
    <>
      <RoomRoundHandDoubleButton
        type="button"
        data-holding={turn.holding}
        disabled={!turn.canDouble}
        title={locale.t('round.turn.doubleTitle')}
        onPointerDown={turn.hold}
        onPointerUp={turn.letGo}
        onPointerLeave={turn.letGo}
        onPointerCancel={turn.letGo}
        onKeyDown={(event) => turn.holdKey(event.key)}
        onKeyUp={turn.letGo}
      >
        {turn.holding && <RoomRoundHandDoubleFill />}
        <RoomRoundHandDoubleLabel>{locale.t('round.turn.double')}</RoomRoundHandDoubleLabel>
      </RoomRoundHandDoubleButton>
      <RoomRoundHandHint>{turn.doubleStakes}</RoomRoundHandHint>
    </>
  );
});
