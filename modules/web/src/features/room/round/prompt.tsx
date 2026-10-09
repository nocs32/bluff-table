import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRoundBill, RoomRoundBillText, RoomRoundBillTitle, RoomRoundPromptCard, RoomRoundPromptCardLabel, RoomRoundPromptHead, RoomRoundPromptText, RoomRoundPromptTime } from './styled-components';

// The prompt at the top left (spec §9.2): the table card, always on show (D22), and what's going on
// in a bold line and a plain one: "Ann played 2 cards as Queens. Believe her and play, or call Liar!"
export const RoomRoundPrompt = observer(function RoomRoundPrompt(): ReactElement | null {
  const { locale, room } = useRootStore();
  const { game } = room;
  const prompt = game.prompt;
  const card = game.tableCard;

  if (!prompt) return null;

  return (
    <RoomRoundBill aria-live="polite">
      <RoomRoundPromptHead>
        {card && (
          <RoomRoundPromptCard title={card.hint}>
            <img src={card.image} alt={card.label} />
            <RoomRoundPromptCardLabel>{locale.t('round.tableCard')}</RoomRoundPromptCardLabel>
          </RoomRoundPromptCard>
        )}
        <RoomRoundPromptText>
          <RoomRoundBillTitle>{prompt.title}</RoomRoundBillTitle>
          <RoomRoundBillText>{prompt.line}</RoomRoundBillText>
          {game.timeLabel && <RoomRoundPromptTime>{game.timeLabel}</RoomRoundPromptTime>}
        </RoomRoundPromptText>
      </RoomRoundPromptHead>
    </RoomRoundBill>
  );
});
