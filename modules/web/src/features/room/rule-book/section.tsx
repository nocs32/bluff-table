import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { RuleBookTab } from '../../../stores/rule-book';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRuleBookExtras } from './extras';
import { RoomRuleBookHeading, RoomRuleBookLead, RoomRuleBookSectionRoot, RoomRuleBookTabNumber, RoomRuleBookText } from './styled-components';

interface RoomRuleBookSectionProps {
  tab: RuleBookTab;
}

// One section of the book: its number and name, the lead line, the words, and between them its
// cards, worked examples or Try it. The scroll hook finds it by `data-section`.
export const RoomRuleBookSection = observer(function RoomRuleBookSection({ tab }: RoomRuleBookSectionProps): ReactElement {
  const { ruleBook } = useRootStore();
  const words = ruleBook.words(tab.section);

  return (
    <RoomRuleBookSectionRoot data-section={tab.section} aria-labelledby={`rules-${tab.section}`}>
      <RoomRuleBookHeading id={`rules-${tab.section}`}>
        <RoomRuleBookTabNumber>{tab.number}</RoomRuleBookTabNumber>
        {tab.label}
      </RoomRuleBookHeading>
      <RoomRuleBookLead>{words.lead}</RoomRuleBookLead>
      {words.before.map((text) => (
        <RoomRuleBookText key={text}>{text}</RoomRuleBookText>
      ))}
      <RoomRuleBookExtras section={tab.section} />
      {words.after.map((text) => (
        <RoomRuleBookText key={text}>{text}</RoomRuleBookText>
      ))}
    </RoomRuleBookSectionRoot>
  );
});
