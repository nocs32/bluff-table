import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { paint } from '../../../art/palette';
import { useRootStore } from '../../../stores/use-root-store';
import { useRoomTableLights } from './use-lights';

// The hanging lamp's warm pool on the felt (spec §8.1), casting shadows; a dim warm room around it,
// so the far wall sits in shadow; and a soft light from your side, so things on the table read. The
// lamp's light swings with the lamp; with lighter graphics it casts no shadows.
export const RoomTableLights = observer(function RoomTableLights(): ReactElement {
  const { table, graphics } = useRootStore();
  const lamp = useRoomTableLights(table);

  return (
    <>
      <ambientLight intensity={0.36} color={paint.lamp} />
      <hemisphereLight args={[paint.lamp, paint.woodDeep, 0.5]} />
      <spotLight
        ref={lamp}
        position={[0, 4.2, 0.3]}
        angle={0.58}
        penumbra={0.8}
        intensity={62}
        decay={1.7}
        distance={12}
        color={paint.lamp}
        castShadow={!graphics.isLight}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.01}
      />
      <directionalLight position={[0, 3, 6]} intensity={0.45} color={paint.card} />
    </>
  );
});
