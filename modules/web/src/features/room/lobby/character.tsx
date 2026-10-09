import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DicesIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button, GameCard } from '../../../ui';
import { RoomMirror } from '../mirror';
import { RoomLobbyCharacterColors } from './character-colors';
import { RoomLobbyCharacterPart } from './character-part';
import { RoomLobbyCharacterBody, RoomLobbyCharacterParts } from './styled-components';

// Your character (spec D7, §8.3, §9.1): you in your mirror, live, as everyone sees you (drag your
// head to nod or shake it), each part with arrows to try the next, the colours nobody else wears,
// and a random roll.
export const RoomLobbyCharacter = observer(function RoomLobbyCharacter(): ReactElement | null {
  const { locale, room } = useRootStore();
  const { character } = room;
  const { me } = character;

  if (!me) return null;

  return (
    <GameCard title={locale.t('character.title')} subtitle={locale.t('character.subtitle')}>
      <RoomLobbyCharacterBody>
        <RoomMirror character={me.character} color={me.color} size="md" />
        <RoomLobbyCharacterParts>
          {character.rows.map((row) => (
            <RoomLobbyCharacterPart key={row.part} row={row} />
          ))}
        </RoomLobbyCharacterParts>
      </RoomLobbyCharacterBody>
      <RoomLobbyCharacterColors />
      <Button tone="secondary" size="sm" type="button" disabled={!character.canEdit} onClick={character.roll}>
        <DicesIcon />
        {locale.t('character.roll')}
      </Button>
    </GameCard>
  );
});
