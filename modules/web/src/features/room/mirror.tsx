import type { Character, PlayerColor } from '@bluff-table/protocol';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { RoomMirrorFrame, RoomMirrorGlass, RoomMirrorPlate, RoomMirrorRoot } from './styled-components';
import { useRoomMirror } from './use-mirror';

interface RoomMirrorProps {
  character: Character;
  color: PlayerColor;
  size: 'md' | 'lg';
}

// Your mirror (spec §7.1, §9.2): an oval in a wooden frame, with you in it as the others see you,
// live. Drag your head in it to move it; a brass plate under it says it's you.
export const RoomMirror = observer(function RoomMirror({ character, color, size }: RoomMirrorProps): ReactElement {
  const { locale, room } = useRootStore();
  const ref = useRoomMirror(room.heads, character, color);

  return (
    <RoomMirrorRoot size={size}>
      <RoomMirrorFrame>
        <RoomMirrorGlass ref={ref} grabbed={room.heads.isGrabbed} aria-label={locale.t('character.preview')} title={locale.t('character.preview')} role="img" />
      </RoomMirrorFrame>
      <RoomMirrorPlate>{locale.t('character.you')}</RoomMirrorPlate>
    </RoomMirrorRoot>
  );
});
