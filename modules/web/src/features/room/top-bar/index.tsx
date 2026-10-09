import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LogoMark, SendIcon, SpinnerIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomTopBarDemo } from './demo';
import { RoomTopBarLink } from './link';
import { RoomTopBarPeople } from './people';
import { RoomTopBarSound } from './sound';
import {
  RoomTopBarBrand,
  RoomTopBarButtonLabel,
  RoomTopBarEnd,
  RoomTopBarLanguage,
  RoomTopBarReconnecting,
  RoomTopBarRoot,
  RoomTopBarStart,
} from './styled-components';

// The brand, the table's link, who's here, sound, language and Share (spec §9.1; the rule book's
// button comes with the rule book). A phone has no room for the link: its browser shows it, and Share
// copies it.
export const RoomTopBar = observer(function RoomTopBar(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { t } = locale;

  return (
    <RoomTopBarRoot compact={ui.layout.isCompact}>
      <RoomTopBarStart>
        <RoomTopBarBrand>
          <LogoMark />
          Bluff Table
        </RoomTopBarBrand>
        <RoomTopBarDemo />
        {room.connection.isReconnecting && (
          <RoomTopBarReconnecting role="status">
            <SpinnerIcon />
            {t('status.reconnecting')}
          </RoomTopBarReconnecting>
        )}
      </RoomTopBarStart>
      {!ui.layout.isCompact && <RoomTopBarLink />}
      <RoomTopBarEnd>
        <RoomTopBarPeople />
        <RoomTopBarSound />
        <RoomTopBarLanguage type="button" aria-label={locale.toggleLabel} title={locale.toggleLabel} onClick={locale.toggle}>
          {locale.code}
        </RoomTopBarLanguage>
        <Button tone="primary" size="sm" type="button" onClick={room.share.copy}>
          <SendIcon />
          <RoomTopBarButtonLabel>{room.share.shareLabel}</RoomTopBarButtonLabel>
        </Button>
      </RoomTopBarEnd>
    </RoomTopBarRoot>
  );
});
