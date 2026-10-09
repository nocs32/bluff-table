import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { Button } from '../../../../ui';
import { RoomRoundHandDouble } from './double';
import { RoomRoundHandActionsRoot, RoomRoundHandHint } from './styled-components';

// Your buttons (spec §9.2): Play the picked cards as the table card, or Liar! on the last play,
// each saying what it means and what's at stake (D22); Liar! ×2 when it's switched on and still
// yours. Out of your turn they wait, dimmed.
export const RoomRoundHandActions = observer(function RoomRoundHandActions(): ReactElement {
  const { locale, room } = useRootStore();
  const { hand, turn, match } = room.game;

  return (
    <RoomRoundHandActionsRoot waiting={!match.isMyTurn} aria-label={locale.t('round.hand.label')}>
      {!turn.isForced && (
        <>
          <Button tone="primary" type="button" disabled={!hand.canPlay} onClick={hand.play}>
            {hand.playLabel}
          </Button>
          {match.isMyTurn && <RoomRoundHandHint>{hand.playHint}</RoomRoundHandHint>}
        </>
      )}
      <Button tone="danger" type="button" disabled={!turn.canCall} title={locale.t('round.turn.callTitle')} onClick={turn.call}>
        {locale.t('round.turn.call')}
      </Button>
      {turn.canCall && <RoomRoundHandHint>{turn.callStakes}</RoomRoundHandHint>}
      {turn.showsDouble && <RoomRoundHandDouble />}
    </RoomRoundHandActionsRoot>
  );
});
