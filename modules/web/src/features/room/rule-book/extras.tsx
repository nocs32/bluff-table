import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { RuleBookSection } from '../../../stores/rule-book';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRuleBookExamples } from './examples';
import { RoomRuleBookCard, RoomRuleBookCards, RoomRuleBookList } from './styled-components';
import { RoomRuleBookTryIt } from './try';

interface RoomRuleBookExtrasProps {
  section: RuleBookSection;
}

// What a section shows besides its words: the four kinds of cards, Try it, the worked calls, the
// odds of each pull, and the crook's calls.
export const RoomRuleBookExtras = observer(function RoomRuleBookExtras({ section }: RoomRuleBookExtrasProps): ReactElement | null {
  const { ruleBook } = useRootStore();

  switch (section) {
    case 'tableCard':
      return (
        <RoomRuleBookCards>
          {ruleBook.ranks.map((card) => (
            <RoomRuleBookCard key={card.key}>
              <img src={card.image} alt="" />
              {card.label}
            </RoomRuleBookCard>
          ))}
        </RoomRuleBookCards>
      );
    case 'turn':
      return <RoomRuleBookTryIt />;
    case 'liar':
      return <RoomRuleBookExamples examples={ruleBook.calls} />;
    case 'whisper':
      return <RoomRuleBookExamples examples={ruleBook.crookCalls} />;
    case 'revolver':
      return (
        <RoomRuleBookList>
          {ruleBook.odds.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </RoomRuleBookList>
      );
    default:
      return null;
  }
});
