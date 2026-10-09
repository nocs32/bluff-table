import type { ReactElement } from 'react';
import { stage } from './layout';
import { useFloorTexture, useWallTexture } from './use-textures';

const { wall, floorY } = stage;

// The saloon's back wall and floor (spec §8.2): inked planks, falling into shadow past the lamp.
export function RoomTableRoom(): ReactElement {
  const wallTexture = useWallTexture();
  const floorTexture = useFloorTexture();

  return (
    <group>
      <mesh position={[0, floorY + wall.height / 2, wall.z]} receiveShadow>
        <planeGeometry args={[wall.width, wall.height]} />
        <meshStandardMaterial map={wallTexture} roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, floorY, wall.z / 2 + 2]} receiveShadow>
        <planeGeometry args={[wall.width, -wall.z + 8]} />
        <meshStandardMaterial map={floorTexture} roughness={1} />
      </mesh>
    </group>
  );
}
