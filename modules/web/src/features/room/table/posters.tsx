import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTablePoster } from './poster';

// The wanted posters on the wall (spec D16, §8.2): the players' own faces and tonight's bounties,
// the highest first.
export const RoomTablePosters = observer(function RoomTablePosters(): ReactElement {
  const { room } = useRootStore();

  return (
    <group>
      {room.presence.posters.map((player, index) => (
        <RoomTablePoster key={player.id} player={player} index={index} />
      ))}
    </group>
  );
});
