import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomMirror } from '../mirror';
import { RoomRoundFaceButton, RoomRoundFaces, RoomRoundMirrorBox } from './styled-components';

// Your mirror at the bottom left (spec §7.1, §7.2, §9.2): you, live, with your face, your cards or
// the gun at your head. Drag your head in it; click it for the face wheel, whose faces everyone sees
// for three seconds. Ghosts too.
export const RoomRoundMirror = observer(function RoomRoundMirror(): ReactElement | null {
  const { locale, room } = useRootStore();
  const me = room.presence.me;
  const { moods } = room.game;

  if (!me || room.game.match.isSpectator) return null;

  return (
    <RoomRoundMirrorBox>
      {moods.wheelOpen && (
        <RoomRoundFaces role="menu" aria-label={locale.t('round.faces.label')}>
          {moods.wheel.map((face) => (
            <RoomRoundFaceButton key={face.mood} type="button" role="menuitem" onClick={() => moods.pick(face.mood)}>
              {face.label}
            </RoomRoundFaceButton>
          ))}
        </RoomRoundFaces>
      )}
      <RoomMirror character={me.character} color={me.color} size="sm" pose={room.game.myPose} onTap={moods.toggleWheel} hint={locale.t('round.mirror.hint')} />
    </RoomRoundMirrorBox>
  );
});
