import type { ReactElement } from 'react';
import { RoomTableCutout } from './cutout';
import { stage } from './layout';
import { RoomTablePerson } from './person';
import { barkeepCharacter, useRoomTableBarkeepAim, useRoomTablePolishing } from './use-barkeep';
import { usePolishingTexture } from './use-textures';

const { bar, floorY } = stage;

// The barkeep behind the counter, polishing a glass (spec §8.2). He walks over to whisper once the
// whisper is in play (spec §5.8).
export function RoomTableBarkeep(): ReactElement {
  const aim = useRoomTableBarkeepAim();
  const polishing = useRoomTablePolishing();
  const glass = usePolishingTexture();

  return (
    <group>
      <RoomTablePerson character={barkeepCharacter} color="red" apron position={[bar.keeperX, floorY + 1, bar.keeperZ]} aim={aim} />
      <group position={[bar.keeperX, floorY + 1.42, bar.keeperZ + 0.12]}>
        <group ref={polishing}>
          <RoomTableCutout texture={glass} width={0.36} />
        </group>
      </group>
    </group>
  );
}
