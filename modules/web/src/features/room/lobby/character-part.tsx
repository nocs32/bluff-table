import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../assets';
import type { CharacterRowView } from '../../../stores/room/character';
import { useRootStore } from '../../../stores/use-root-store';
import { IconButton } from '../../../ui';
import { RoomLobbyCharacterPartLabel, RoomLobbyCharacterPartRoot, RoomLobbyCharacterPartText, RoomLobbyCharacterPartValue } from './styled-components';

interface RoomLobbyCharacterPartProps {
  row: CharacterRowView;
}

// One part of your character (hat, face, hair, scar, straw): what it is now, with arrows either
// side to try the one before or the next.
export const RoomLobbyCharacterPart = observer(function RoomLobbyCharacterPart({ row }: RoomLobbyCharacterPartProps): ReactElement {
  const { character } = useRootStore().room;

  return (
    <RoomLobbyCharacterPartRoot>
      <IconButton surface="print" type="button" aria-label={row.previousLabel} title={row.previousLabel} disabled={!character.canEdit} onClick={() => character.step(row.part, -1)}>
        <ChevronLeftIcon />
      </IconButton>
      <RoomLobbyCharacterPartText>
        <RoomLobbyCharacterPartLabel>{row.label}</RoomLobbyCharacterPartLabel>
        <RoomLobbyCharacterPartValue aria-live="polite">{row.valueLabel}</RoomLobbyCharacterPartValue>
      </RoomLobbyCharacterPartText>
      <IconButton surface="print" type="button" aria-label={row.nextLabel} title={row.nextLabel} disabled={!character.canEdit} onClick={() => character.step(row.part, 1)}>
        <ChevronRightIcon />
      </IconButton>
    </RoomLobbyCharacterPartRoot>
  );
});
