import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomRuleBookText, RoomRuleBookTry, RoomRuleBookTryCard, RoomRuleBookTryRow, RoomRuleBookVerdict } from './styled-components';

// Try it (spec §9.4): pick the table card, then up to three cards from a hand; the engine says
// whether that play would be the truth, and who'd pull if it were called.
export const RoomRuleBookTryIt = observer(function RoomRuleBookTryIt(): ReactElement {
  const { locale, ruleBook } = useRootStore();
  const { tryIt } = ruleBook;
  const verdict = tryIt.verdict;

  return (
    <RoomRuleBookTry>
      <RoomRuleBookText>
        <strong>{locale.t('book.try.title')}.</strong> {locale.t('book.try.line')}
      </RoomRuleBookText>
      <RoomRuleBookTryRow>
        {locale.t('book.try.tableCard')}:
        {tryIt.ranks.map((rank) => (
          <Button key={rank.rank} size="sm" tone={rank.isCurrent ? 'primary' : 'secondary'} type="button" aria-pressed={rank.isCurrent} onClick={() => tryIt.setRank(rank.rank)}>
            {rank.label}
          </Button>
        ))}
      </RoomRuleBookTryRow>
      <RoomRuleBookTryRow>
        {tryIt.cards.map((card) => (
          <RoomRuleBookTryCard key={card.index} type="button" aria-pressed={card.picked} title={card.label} onClick={() => tryIt.toggle(card.index)}>
            <img src={card.image} alt={card.label} />
          </RoomRuleBookTryCard>
        ))}
      </RoomRuleBookTryRow>
      <RoomRuleBookVerdict lie={verdict.lie === null ? 'none' : verdict.lie} aria-live="polite">
        {verdict.text}
      </RoomRuleBookVerdict>
    </RoomRuleBookTry>
  );
});
