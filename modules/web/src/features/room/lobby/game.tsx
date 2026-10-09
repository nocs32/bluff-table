import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { HelpIcon } from '../../../assets';
import { GameCard, IconButton, SettingSlider, SettingSwitch } from '../../../ui';
import { RoomLobbyGameSwitch, RoomLobbyGameSwitches } from './styled-components';

// How a game runs (spec §5.10): the time per turn, and our two twists as switches, both off by
// default. Each says in one line what it does (spec D22), with its part of the rule book behind a
// (?). Anyone may change them.
export const RoomLobbyGame = observer(function RoomLobbyGame(): ReactElement {
  const { locale, room, ruleBook } = useRootStore();
  const { settings } = room.game;
  const slider = settings.turnTime;

  return (
    <GameCard title={locale.t('lobby.game')} subtitle={locale.t('lobby.gameSubtitle')}>
      <SettingSlider
        label={slider.label}
        valueText={slider.valueText}
        hint={slider.hint}
        value={slider.value}
        range={slider.range}
        disabled={!settings.isEditable}
        surface="print"
        onPreview={slider.preview}
        onCommit={settings.commitSliders}
      />
      <RoomLobbyGameSwitches>
        {settings.switchViews.map((view) => (
          <RoomLobbyGameSwitch key={view.name} on={view.on}>
            <SettingSwitch label={view.label} hint={view.hint} checked={view.on} disabled={!settings.isEditable} surface="print" onChange={(on) => settings.setSwitch(view.name, on)} />
            <IconButton surface="print" type="button" aria-label={view.more} title={view.more} onClick={() => ruleBook.open(view.section)}>
              <HelpIcon />
            </IconButton>
          </RoomLobbyGameSwitch>
        ))}
      </RoomLobbyGameSwitches>
    </GameCard>
  );
});
