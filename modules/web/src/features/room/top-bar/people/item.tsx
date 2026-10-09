import type { ReactElement } from 'react';
import type { PlayerView } from '../../../../stores/room/presence';
import { Avatar } from '../../../../ui';
import { RoomTopBarPeoplePanelItemName, RoomTopBarPeoplePanelItemNote, RoomTopBarPeoplePanelItemRoot } from './styled-components';

interface RoomTopBarPeoplePanelItemProps {
  member: PlayerView;
}

export function RoomTopBarPeoplePanelItem({ member }: RoomTopBarPeoplePanelItemProps): ReactElement {
  return (
    <RoomTopBarPeoplePanelItemRoot>
      <Avatar portrait={member.portrait} color={member.color} size="md" presence={member.status} bot={member.isBot} />
      <RoomTopBarPeoplePanelItemName>{member.name}</RoomTopBarPeoplePanelItemName>
      {member.note && <RoomTopBarPeoplePanelItemNote>{member.note}</RoomTopBarPeoplePanelItemNote>}
    </RoomTopBarPeoplePanelItemRoot>
  );
}
