import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { CallExampleView } from '../../../stores/rule-book';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomRuleBookExample, RoomRuleBookExampleCards, RoomRuleBookExampleText, RoomRuleBookStamp } from './styled-components';

interface RoomRuleBookExamplesProps {
  examples: CallExampleView[];
}

// Worked examples of a call (spec §9.4), each one worked out by the engine: the cards, what they
// claimed, TRUE or LIE, and who pulls the trigger.
export const RoomRuleBookExamples = observer(function RoomRuleBookExamples({ examples }: RoomRuleBookExamplesProps): ReactElement {
  const { locale } = useRootStore();

  return (
    <ul>
      {examples.map((example) => (
        <RoomRuleBookExample key={example.key}>
          <RoomRuleBookExampleCards>
            {example.cards.map((card) => (
              <img key={card.key} src={card.image} alt={card.label} title={card.label} />
            ))}
          </RoomRuleBookExampleCards>
          <RoomRuleBookExampleText>
            {example.claim}
            <RoomRuleBookStamp lie={example.lie}>{locale.t(example.lie ? 'book.liar.lie' : 'book.liar.true')}</RoomRuleBookStamp>
            {example.verdict}
          </RoomRuleBookExampleText>
        </RoomRuleBookExample>
      ))}
    </ul>
  );
});
