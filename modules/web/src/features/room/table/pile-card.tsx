import type { ReactElement } from 'react';
import type { CanvasTexture } from 'three';
import { RoomTableCutout } from './cutout';
import type { PileCardSpot } from './use-pile';
import { useRoomTablePileCard } from './use-pile-card';

interface RoomTablePileCardProps {
  spot: PileCardSpot;
  texture: CanvasTexture;
}

// One face-down card on the pile, sliding in from whoever played it.
export function RoomTablePileCard({ spot, texture }: RoomTablePileCardProps): ReactElement {
  const ref = useRoomTablePileCard(spot);

  return (
    <group ref={ref}>
      <RoomTableCutout texture={texture} width={0.22} flat shadow />
    </group>
  );
}
