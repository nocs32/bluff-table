import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomRoundGunRing } from './ring';
import { RoomRoundGunButton, RoomRoundGunCylinder, RoomRoundGunLine, RoomRoundGunPress, RoomRoundGunRoot, RoomRoundGunSeconds, RoomRoundGunText, RoomRoundGunTitle } from './styled-components';

// When it's your gun (spec §8.4): your cylinder and the odds, why it's you, and Pull the trigger,
// pressed by you, inside a ring that runs down over ten seconds before it pulls by itself.
export const RoomRoundGun = observer(function RoomRoundGun(): ReactElement {
  const { locale, room } = useRootStore();
  const { pull } = room.game;

  return (
    <RoomRoundGunRoot aria-live="assertive">
      <RoomRoundGunCylinder src={pull.cylinder} alt={pull.odds} />
      <RoomRoundGunText>
        <RoomRoundGunTitle>{locale.t('round.pull.youTitle')}</RoomRoundGunTitle>
        <RoomRoundGunLine>{pull.reason}</RoomRoundGunLine>
        {pull.pullsLabel && <RoomRoundGunLine>{pull.pullsLabel}</RoomRoundGunLine>}
        <RoomRoundGunLine>{pull.canPress ? locale.t('round.pull.buttonHint') : locale.t('round.pull.pressed')}</RoomRoundGunLine>
      </RoomRoundGunText>
      <RoomRoundGunPress>
        <RoomRoundGunRing spent={pull.spent} />
        <RoomRoundGunButton type="button" disabled={!pull.canPress} onClick={pull.press}>
          {locale.t('round.pull.button')}
        </RoomRoundGunButton>
        {pull.canPress && <RoomRoundGunSeconds>{pull.secondsLeft}</RoomRoundGunSeconds>}
      </RoomRoundGunPress>
    </RoomRoundGunRoot>
  );
});
