import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DoubleSide } from 'three';
import type { SwitchView } from '../../../stores/room/game/settings';
import { useRootStore } from '../../../stores/use-root-store';
import { furniture } from './palette';
import { useRoomTablePoke } from './use-poke';
import { tentShape, useRoomTableTentSpot } from './use-tent';
import { useTentTexture } from './use-textures';

interface RoomTableTentsItemProps {
  view: SwitchView;
  index: number;
  count: number;
}

// One tent card: folded card stock standing on the felt, the switch's name printed on the front.
// Point at it and its tooltip says what the switch does.
export const RoomTableTentsItem = observer(function RoomTableTentsItem({ view, index, count }: RoomTableTentsItemProps): ReactElement {
  const { table } = useRootStore();
  const texture = useTentTexture(view.label);
  const spot = useRoomTableTentSpot(index, count);
  const ref = useRoomTablePoke(table.hovered?.kind === 'tent' && table.hovered.name === view.name, true, 11 + index);
  const target = { kind: 'tent', name: view.name, hint: view.hint } as const;

  return (
    <group position={spot.position} rotation-y={spot.yaw}>
      <group ref={ref}>
        <mesh position={tentShape.front.position} rotation-x={tentShape.front.tilt} castShadow onPointerOver={() => table.hover(target)} onPointerOut={() => table.leave(target)}>
          <planeGeometry args={[tentShape.width, tentShape.height]} />
          <meshStandardMaterial map={texture} roughness={0.4} />
        </mesh>
        <mesh position={tentShape.back.position} rotation-x={tentShape.back.tilt} castShadow>
          <planeGeometry args={[tentShape.width, tentShape.height]} />
          <meshStandardMaterial color={furniture.cardEdge} roughness={0.5} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  );
});
