import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { furniture, glow } from './palette';
import { useRoomTableFuse } from './use-fuse';

// Your turn's last 8 seconds (spec D14): a fuse burns along your edge of the table, a spark eating
// its way across. When it reaches the end, the table plays for you.
export const RoomTableFuse = observer(function RoomTableFuse(): ReactElement {
  const { room } = useRootStore();
  const { geometry, spark, light } = useRoomTableFuse(room.game.match);

  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color={furniture.rope} emissive={furniture.warm} emissiveIntensity={0.12} roughness={0.9} />
      </mesh>
      <mesh ref={spark}>
        <sphereGeometry args={[0.028, 12, 8]} />
        <meshBasicMaterial color={glow.spark} toneMapped={false} />
      </mesh>
      <pointLight ref={light} color={furniture.warm} distance={0.9} decay={2} />
    </group>
  );
});
