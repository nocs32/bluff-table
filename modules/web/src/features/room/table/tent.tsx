import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { SwitchView } from '../../../stores/room/game/settings';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableCutout } from './cutout';
import { useRoomTablePoke } from './use-poke';
import { useRoomTableTentSpot } from './use-tent';
import { useTentTexture } from './use-textures';

interface RoomTableTentProps {
  view: SwitchView;
  index: number;
  count: number;
}

// One tent card on the felt: the switch's name, its tooltip saying what it does (spec D22), and a
// click opens its part of the rule book. It pops up when the switch goes on.
export const RoomTableTent = observer(function RoomTableTent({ view, index, count }: RoomTableTentProps): ReactElement {
  const { table, ruleBook } = useRootStore();
  const texture = useTentTexture(view.label, table.fontsReady);
  const spot = useRoomTableTentSpot(index, count);
  const ref = useRoomTablePoke(table.hovered?.kind === 'tent' && table.hovered.name === view.name, true, 11 + index);
  const target = { kind: 'tent', name: view.name, hint: view.hint } as const;

  return (
    <group position={spot}>
      <group ref={ref}>
        <RoomTableCutout texture={texture} width={0.62} anchor="bottom" shadow onPointerOver={() => table.hover(target)} onPointerOut={() => table.leave(target)} onClick={() => ruleBook.open(view.section)} />
      </group>
    </group>
  );
});
