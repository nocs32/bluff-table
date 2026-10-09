import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableRevolver } from './revolver';

// Everyone's own six-shooter (spec D15), yours included, each lying at its owner's place.
export const RoomTableRevolvers = observer(function RoomTableRevolvers(): ReactElement {
  const { seats } = useRootStore().room;

  return (
    <group>
      {seats.revolvers.map((view) => (
        <RoomTableRevolver key={view.id} view={view} />
      ))}
    </group>
  );
});
