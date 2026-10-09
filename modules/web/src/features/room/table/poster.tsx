import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { PlayerView } from '../../../stores/room/presence';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { posterSpots } from './layout';
import { usePosterTexture } from './use-textures';

interface RoomTablePosterProps {
  player: PlayerView;
  index: number;
}

// One wanted poster, pinned to the wall: a player's face, name and bounty.
export const RoomTablePoster = observer(function RoomTablePoster({ player, index }: RoomTablePosterProps): ReactElement | null {
  const { locale, table } = useRootStore();
  const spot = posterSpots[index];
  const texture = usePosterTexture({ character: player.character, color: player.color, wanted: locale.t('table.wanted'), name: player.name, reward: player.reward }, table.fontsReady);

  if (!spot) return null;

  return <RoomTableCutout texture={texture} width={0.68} position={spot} />;
});
