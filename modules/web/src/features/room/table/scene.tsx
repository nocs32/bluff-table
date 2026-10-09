import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { paint } from '../../../art/palette';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableEffects } from './effects';
import { RoomTableFurniture } from './furniture';
import { RoomTableLamp } from './lamp';
import { RoomTableLights } from './lights';
import { furniture } from './palette';
import { RoomTableTents } from './tents';
import { useRoomTableCamera } from './use-camera';
import { useRoomTableFrameRate } from './use-frame-rate';
import { useRoomTablePointer } from './use-pointer';
import { usePanellingTexture } from './use-textures';

// The empty stage, until M1 builds the cardboard saloon (spec §8): the felt table in the lamp's pool
// of light, plank walls falling into shadow behind it, and on the felt the tent cards of the switches
// that are on. With lighter graphics there's no glow (spec §8.5).
export const RoomTableScene = observer(function RoomTableScene(): ReactElement {
  const { table, graphics } = useRootStore();
  const panelling = usePanellingTexture();

  useRoomTableCamera({ left: table.insetLeft, right: table.insetRight });
  useRoomTableFrameRate(graphics.drop);
  useRoomTablePointer(table);

  return (
    <>
      <color attach="background" args={[paint.woodDeep]} />
      <fog attach="fog" args={[paint.woodDeep, 8, 20]} />
      <RoomTableLights />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.82, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={furniture.floor} roughness={1} />
      </mesh>
      <mesh position={[0, 2.2, -4.6]}>
        <planeGeometry args={[24, 6]} />
        <meshStandardMaterial map={panelling} roughness={0.75} />
      </mesh>
      <RoomTableFurniture />
      <RoomTableLamp />
      <RoomTableTents />
      {!graphics.isLight && <RoomTableEffects />}
    </>
  );
});
