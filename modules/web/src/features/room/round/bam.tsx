import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundBamBurst, RoomRoundBamDark, RoomRoundBamRoot, RoomRoundBamWord } from './styled-components';

// A bang (spec D20, §8.4): the lights go out for a split second, then a comic-book BAM! bursts out of
// the dark and fades, and the room comes back with someone slumped across the table.
export const RoomRoundBam = observer(function RoomRoundBam(): ReactElement | null {
  const { locale, table } = useRootStore();

  if (!table.bang) return null;

  return (
    <RoomRoundBamRoot key={table.bang.count} aria-hidden>
      <RoomRoundBamDark />
      <RoomRoundBamBurst>
        <RoomRoundBamWord>{locale.t('round.bam')}</RoomRoundBamWord>
      </RoomRoundBamBurst>
    </RoomRoundBamRoot>
  );
});
