import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CloseIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { IconButton } from '../../../ui';
import { RoomRuleBookSection } from './section';
import { RoomRuleBookBackdrop, RoomRuleBookBody, RoomRuleBookContent, RoomRuleBookHead, RoomRuleBookPositioner, RoomRuleBookScroll, RoomRuleBookStar, RoomRuleBookTitle } from './styled-components';
import { RoomRuleBookTabs } from './tabs';
import { useRoomRuleBookScroll } from './use-scroll';

// The rule book (spec D23, §9.4), over everything: a saloon handbill with its index tabs and one
// long page. It never pauses the game; Escape, the backdrop or the close button put it away.
export const RoomRuleBook = observer(function RoomRuleBook(): ReactElement {
  const { locale, ruleBook } = useRootStore();
  const scroll = useRoomRuleBookScroll(ruleBook.jump, ruleBook.see);

  return (
    <Dialog.Root open={ruleBook.isOpen} onOpenChange={(details) => ruleBook.setOpen(details.open)} lazyMount unmountOnExit>
      <Portal>
        <RoomRuleBookBackdrop />
        <RoomRuleBookPositioner>
          <RoomRuleBookContent>
            <RoomRuleBookHead>
              <RoomRuleBookStar aria-hidden>★</RoomRuleBookStar>
              <RoomRuleBookTitle>{locale.t('book.title')}</RoomRuleBookTitle>
              <Dialog.CloseTrigger asChild>
                <IconButton surface="print" aria-label={locale.t('book.close')} title={locale.t('book.close')}>
                  <CloseIcon />
                </IconButton>
              </Dialog.CloseTrigger>
            </RoomRuleBookHead>
            <RoomRuleBookBody>
              <RoomRuleBookTabs />
              <RoomRuleBookScroll ref={scroll}>
                {ruleBook.tabs.map((tab) => (
                  <RoomRuleBookSection key={tab.section} tab={tab} />
                ))}
              </RoomRuleBookScroll>
            </RoomRuleBookBody>
          </RoomRuleBookContent>
        </RoomRuleBookPositioner>
      </Portal>
    </Dialog.Root>
  );
});
