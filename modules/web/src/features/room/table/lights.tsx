import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { paint } from '../../../art/palette';
import { useRootStore } from '../../../stores/use-root-store';
import { lampHang, stage } from './layout';
import { lampIntensity, useRoomTableLights } from './use-lights';
import { useRoomTableRoomLights } from './use-room-lights';

const { bar, floorY } = stage;

// The full brightness of the room's other lights: the glow everywhere, the sky through the
// windows, the lamps over the bar and by the doors, and a faint light from your side.
const levels = [0.45, 0.55, 5, 3, 0.55] as const;

// One oil lamp lights the saloon (spec §8.1): a warm light from its flame that falls off fast, so
// the table glows and the far wall sits in shadow, casting the cut-outs' shadows (none with lighter
// graphics). A dimmer lamp over the bar keeps the back of the room in sight, and a faint light from
// your side lets the faces across the table read. They all dim for a pull and go out on a bang.
export const RoomTableLights = observer(function RoomTableLights(): ReactElement {
  const { table, graphics } = useRootStore();
  const lamp = useRoomTableLights(table);
  const [glow, sky, overBar, byDoors, front] = useRoomTableRoomLights(table, levels);

  return (
    <>
      <ambientLight ref={glow} intensity={levels[0]} color={paint.glow} />
      <hemisphereLight ref={sky} args={[paint.glow, paint.night, levels[1]]} />
      <pointLight
        ref={lamp}
        position={[lampHang.pivot[0], lampHang.pivot[1] - lampHang.rod - lampHang.flame, lampHang.pivot[2]]}
        intensity={lampIntensity}
        decay={1.4}
        color={paint.glow}
        castShadow={!graphics.isLight}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.004}
        shadow-radius={6}
      />
      <pointLight ref={overBar} position={[bar.x + 0.6, floorY + 2.6, bar.counterZ + 0.8]} intensity={levels[2]} decay={1.6} color={paint.warm} />
      <pointLight ref={byDoors} position={[stage.doors.x - 1.4, floorY + 2.6, stage.wall.z + 1.4]} intensity={levels[3]} decay={1.6} color={paint.warm} />
      <directionalLight ref={front} position={[0, 2, 6]} intensity={levels[4]} color={paint.card} />
    </>
  );
});
