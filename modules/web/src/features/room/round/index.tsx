import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundBam } from './bam';
import { RoomRoundCaptions } from './captions';
import { RoomRoundGhost } from './ghost';
import { RoomRoundGun } from './gun';
import { RoomRoundHand } from './hand';
import { RoomRoundMirror } from './mirror';
import { RoomRoundOver } from './over';
import { RoomRoundPrompt } from './prompt';
import { RoomRoundBottom, RoomRoundCloseIn, RoomRoundColumn, RoomRoundRedden, RoomRoundRoot, RoomRoundTop } from './styled-components';
import { useRoomRoundInsets } from './use-insets';
import { RoomRoundWhisper } from './whisper';

// A game over the saloon (spec §9.2): the prompt with the table card and your whisper at the top
// left, what just happened in the middle, a ghost's sight on the right; your mirror, your hand and
// your buttons along the bottom, or your gun when it's yours to pull. A bang puts the lights out;
// the end of a game shows the summary.
export const RoomRound = observer(function RoomRound(): ReactElement {
  const { room, table, ui } = useRootStore();
  const { game } = room;
  const ref = useRoomRoundInsets(table, ui.layout.isCompact);

  return (
    <RoomRoundRoot ref={ref}>
      {game.pull.isMine && <RoomRoundCloseIn />}
      {game.turn.holding && <RoomRoundRedden />}
      <RoomRoundTop>
        <RoomRoundColumn side="left">
          <RoomRoundPrompt />
          <RoomRoundWhisper />
        </RoomRoundColumn>
        <RoomRoundColumn side="middle">
          <RoomRoundCaptions />
        </RoomRoundColumn>
        <RoomRoundColumn side="right">
          <RoomRoundGhost />
        </RoomRoundColumn>
      </RoomRoundTop>
      <RoomRoundBottom data-foot>
        <RoomRoundMirror />
        {game.pull.isMine ? <RoomRoundGun /> : game.match.isAlive && <RoomRoundHand />}
      </RoomRoundBottom>
      <RoomRoundBam />
      {game.isOver && <RoomRoundOver />}
    </RoomRoundRoot>
  );
});
