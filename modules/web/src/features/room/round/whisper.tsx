import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundBill, RoomRoundBillText, RoomRoundBillTitle } from './styled-components';

// The barkeep's whisper, when it was to you (spec §5.8, §9.2): what the house is, and what that
// means for you this round. Nobody else sees it.
export const RoomRoundWhisper = observer(function RoomRoundWhisper(): ReactElement | null {
  const { room } = useRootStore();
  const strip = room.game.secrets.whisper;

  if (!strip) return null;

  return (
    <RoomRoundBill tone={strip.crooked ? 'crooked' : 'straight'} role="status">
      <RoomRoundBillTitle>{strip.title}</RoomRoundBillTitle>
      <RoomRoundBillText>{strip.line}</RoomRoundBillText>
    </RoomRoundBill>
  );
});
