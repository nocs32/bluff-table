import type { Character, PlayerColor } from '@bluff-table/protocol';
import type { MirrorPose } from '../../stores/room/game';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { RoomMirrorFrame, RoomMirrorGlass, RoomMirrorPlate, RoomMirrorRoot } from './styled-components';
import { useRoomMirror } from './use-mirror';

interface RoomMirrorProps {
  character: Character;
  color: PlayerColor;
  size: 'sm' | 'md' | 'lg';
  // In a round: your face and what you hold, and a click for the face wheel.
  pose?: () => MirrorPose;
  onTap?: () => void;
  hint?: string;
}

// Your mirror (spec §7.1, §9.2): an oval in a wooden frame, with you in it as the others see you,
// live. Drag your head in it to move it; a brass plate under it says it's you.
export const RoomMirror = observer(function RoomMirror({ character, color, size, pose, onTap, hint }: RoomMirrorProps): ReactElement {
  const { locale, room } = useRootStore();
  const ref = useRoomMirror(room.heads, { character, color, pose, onTap });

  return (
    <RoomMirrorRoot size={size}>
      <RoomMirrorFrame>
        <RoomMirrorGlass ref={ref} grabbed={room.heads.isGrabbed} aria-label={hint ?? locale.t('character.preview')} title={hint ?? locale.t('character.preview')} role="img" />
      </RoomMirrorFrame>
      <RoomMirrorPlate>{locale.t('character.you')}</RoomMirrorPlate>
    </RoomMirrorRoot>
  );
});
