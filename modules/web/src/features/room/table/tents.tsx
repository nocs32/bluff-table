import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableTent } from './tent';

// The switches that are on stand on the felt as little tent cards (spec §5.10), either side of the
// deck in the middle, where everyone can read them and they hide nobody's name tag or revolver.
// Point at one and it says what it does.
export const RoomTableTents = observer(function RoomTableTents(): ReactElement {
  const { settings } = useRootStore().room.game;

  return (
    <group>
      {settings.activeSwitches.map((view, index) => (
        <RoomTableTent key={view.name} view={view} index={index} count={settings.activeSwitches.length} />
      ))}
    </group>
  );
});
