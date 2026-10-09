import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { paint } from '../../../art/palette';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableBar } from './bar';
import { RoomTableDoors } from './doors';
import { RoomTableEffects } from './effects';
import { RoomTableFurniture } from './furniture';
import { RoomTableLamp } from './lamp';
import { RoomTableLights } from './lights';
import { RoomTablePlaces } from './places';
import { RoomTablePosters } from './posters';
import { RoomTableRevolvers } from './revolvers';
import { RoomTableRoom } from './room';
import { RoomTableTents } from './tents';
import { useRoomTableCamera } from './use-camera';
import { useRoomTableFrameRate } from './use-frame-rate';
import { useRoomTableHeads } from './use-heads';
import { useRoomTablePointer } from './use-pointer';

// The cardboard saloon (spec §8): every piece an ink drawing cut out of card, standing in layers
// under one oil lamp. Back to front: the plank wall with the bar, the barkeep, the wanted posters
// and the swinging doors; the chairs and the people across the table; the table with the deck and
// everyone's revolver; and the lamp hanging over it all. With lighter graphics there's no glow or grain.
export const RoomTableScene = observer(function RoomTableScene(): ReactElement {
  const { table, graphics, room } = useRootStore();

  useRoomTableCamera(table.insets);
  useRoomTableFrameRate(graphics.drop);
  useRoomTablePointer(table, room.heads);
  useRoomTableHeads(room.heads);

  return (
    <>
      <color attach="background" args={[paint.night]} />
      <fog attach="fog" args={[paint.night, 7, 16]} />
      <RoomTableLights />
      <RoomTableRoom />
      <RoomTableBar />
      <RoomTablePosters />
      <RoomTableDoors />
      <RoomTablePlaces />
      <RoomTableFurniture />
      <RoomTableRevolvers />
      <RoomTableTents />
      <RoomTableLamp />
      {!graphics.isLight && <RoomTableEffects />}
    </>
  );
});
