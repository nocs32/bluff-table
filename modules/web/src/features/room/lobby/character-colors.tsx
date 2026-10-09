import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomLobbyCharacterColorsLabel, RoomLobbyCharacterColorsList, RoomLobbyCharacterColorsRoot, RoomLobbyCharacterSwatch } from './styled-components';

// Your colour (spec §8.3): it dyes your hat or its band, your name tag and your frame. A colour
// someone else wears is crossed out, and its tooltip says who.
export const RoomLobbyCharacterColors = observer(function RoomLobbyCharacterColors(): ReactElement {
  const { locale, room } = useRootStore();
  const { character } = room;

  return (
    <RoomLobbyCharacterColorsRoot>
      <RoomLobbyCharacterColorsLabel>{locale.t('character.color')}</RoomLobbyCharacterColorsLabel>
      <RoomLobbyCharacterColorsList>
        {character.colors.map((view) => (
          <RoomLobbyCharacterSwatch
            key={view.color}
            type="button"
            tone={view.color}
            taken={view.taken}
            aria-pressed={view.picked}
            aria-label={view.label}
            title={view.label}
            disabled={view.taken || !character.canEdit}
            onClick={() => character.pickColor(view.color)}
          />
        ))}
      </RoomLobbyCharacterColorsList>
    </RoomLobbyCharacterColorsRoot>
  );
});
