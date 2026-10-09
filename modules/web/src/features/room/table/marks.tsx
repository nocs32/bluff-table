import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { Occupant } from '../../../stores/room/seats';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import type { PlaceSpots } from './use-place';
import { useShotTexture, useWhisperMarkTexture } from './use-textures';

interface RoomTableMarksProps {
  occupant: Occupant;
  spots: PlaceSpots;
}

// The little marks at a place (spec §8.2): a speech bubble over the name tag of whoever got the
// barkeep's whisper this round, and a whiskey shot while they still have their Liar! ×2. Each says
// what it means when pointed at.
export const RoomTableMarks = observer(function RoomTableMarks({ occupant, spots }: RoomTableMarksProps): ReactElement {
  const { room, table, locale } = useRootStore();
  const bubble = useWhisperMarkTexture();
  const shot = useShotTexture();
  const { match, settings } = room.game;
  const seat = match.seat(occupant.id);
  const whisper = { kind: 'info', id: `whisper-${occupant.id}`, hint: locale.t('round.whisper.mark', { name: occupant.name }) } as const;
  const drink = { kind: 'info', id: `shot-${occupant.id}`, hint: locale.t('round.table.shot', { name: occupant.name }) } as const;

  return (
    <group>
      {match.round?.whispered === occupant.id && <RoomTableCutout texture={bubble} width={0.22} position={spots.mark} onPointerOver={() => table.hover(whisper)} onPointerOut={() => table.leave(whisper)} />}
      {settings.switches.doubleCall && seat?.alive && !seat.doubleUsed && <RoomTableCutout texture={shot} width={0.1} anchor="bottom" position={spots.shot} shadow onPointerOver={() => table.hover(drink)} onPointerOut={() => table.leave(drink)} />}
    </group>
  );
});
