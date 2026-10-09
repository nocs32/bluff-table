import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundCaption, RoomRoundCaptionMore } from './styled-components';

// What just happened, a line each (spec D22), with the rule book's section about it one click away.
export const RoomRoundCaptions = observer(function RoomRoundCaptions(): ReactElement {
  const { locale, room, ruleBook } = useRootStore();

  return (
    <>
      {room.game.captions.items.map((item) => (
        <RoomRoundCaption key={item.id} loud={item.loud} role="status">
          {item.text}
          {item.section && (
            <RoomRoundCaptionMore type="button" onClick={() => ruleBook.open(item.section ?? 'goal')}>
              {locale.t('round.captions.more')}
            </RoomRoundCaptionMore>
          )}
        </RoomRoundCaption>
      ))}
    </>
  );
});
