import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomRoundBillText, RoomRoundOverBounty, RoomRoundOverButtons, RoomRoundOverCard, RoomRoundOverLines, RoomRoundOverRoot, RoomRoundOverTitle } from './styled-components';

// The end of a game (spec §4.4): who won and their new bounty, who died when, the boldest lie and
// the best call; then Play again with everyone, or back to the lobby to change things first.
export const RoomRoundOver = observer(function RoomRoundOver(): ReactElement {
  const { locale, room } = useRootStore();
  const { summary } = room.game;

  return (
    <RoomRoundOverRoot>
      <RoomRoundOverCard aria-live="polite">
        <RoomRoundBillText>{locale.t('round.over.title')}</RoomRoundBillText>
        <RoomRoundOverTitle>{summary.title}</RoomRoundOverTitle>
        <RoomRoundOverBounty>{summary.bounty}</RoomRoundOverBounty>
        <RoomRoundOverLines>
          {summary.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </RoomRoundOverLines>
        <RoomRoundOverButtons>
          <Button tone="primary" size="lg" type="button" title={locale.t('round.over.playAgainHint')} onClick={summary.playAgain}>
            {locale.t('round.over.playAgain')}
          </Button>
          <Button type="button" title={locale.t('round.over.toLobbyHint')} onClick={summary.toLobby}>
            {locale.t('round.over.toLobby')}
          </Button>
        </RoomRoundOverButtons>
        <RoomRoundBillText>{locale.t('round.over.playAgainHint')}</RoomRoundBillText>
      </RoomRoundOverCard>
    </RoomRoundOverRoot>
  );
});
