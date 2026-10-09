import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTablePlace } from './place';

// The five places across the table, laid out for six (spec D9, §9.2): you sit at the near edge,
// and the others take the chairs across, then the sides, then the far corners.
export const RoomTablePlaces = observer(function RoomTablePlaces(): ReactElement {
  const { seats } = useRootStore().room;

  return (
    <group>
      {seats.places.map((place) => (
        <RoomTablePlace key={place.angle} place={place} />
      ))}
    </group>
  );
});
