import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { paint } from '../../../art/palette';
import { useRootStore } from '../../../stores/use-root-store';
import { lampHang, stage } from './layout';
import { useRoomTableLights } from './use-lights';

const { bar, floorY } = stage;

// One oil lamp lights the saloon (spec §8.1): a warm light from its flame that falls off fast, so
// the table glows and the far wall sits in shadow, casting the cut-outs' shadows (none with lighter
// graphics). A dimmer lamp over the bar keeps the back of the room in sight, and a faint light from
// your side lets the faces across the table read.
export const RoomTableLights = observer(function RoomTableLights(): ReactElement {
  const { table, graphics } = useRootStore();
  const lamp = useRoomTableLights(table);

  return (
    <>
      <ambientLight intensity={0.45} color={paint.glow} />
      <hemisphereLight args={[paint.glow, paint.night, 0.55]} />
      <pointLight
        ref={lamp}
        position={[lampHang.pivot[0], lampHang.pivot[1] - lampHang.rod - lampHang.flame, lampHang.pivot[2]]}
        intensity={16}
        decay={1.4}
        color={paint.glow}
        castShadow={!graphics.isLight}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.004}
        shadow-radius={6}
      />
      <pointLight position={[bar.x + 0.6, floorY + 2.6, bar.counterZ + 0.8]} intensity={5} decay={1.6} color={paint.warm} />
      <pointLight position={[stage.doors.x - 1.4, floorY + 2.6, stage.wall.z + 1.4]} intensity={3} decay={1.6} color={paint.warm} />
      <directionalLight position={[0, 2, 6]} intensity={0.55} color={paint.card} />
    </>
  );
});
