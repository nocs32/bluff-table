import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableTentsItem } from './tent';

// The switches that are on stand on the table as little tent cards (spec §5.10), so everyone can
// see what's in play. M1 moves them to the bar.
export const RoomTableTents = observer(function RoomTableTents(): ReactElement {
  const { settings } = useRootStore().room.game;

  return (
    <group>
      {settings.activeSwitches.map((view, index) => (
        <RoomTableTentsItem key={view.name} view={view} index={index} count={settings.activeSwitches.length} />
      ))}
    </group>
  );
});
