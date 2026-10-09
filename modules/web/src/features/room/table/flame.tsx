import type { ReactElement } from 'react';
import { AdditiveBlending } from 'three';
import { lampHang } from './layout';
import { glow } from './palette';
import { useHaloTexture } from './use-textures';

// The lamp's flame, brighter than white so the glow picks it up, in a soft halo of warm light.
export function RoomTableFlame(): ReactElement {
  const halo = useHaloTexture();

  return (
    <group position={[0, -lampHang.flame, 0]}>
      <mesh position-z={0.01}>
        <circleGeometry args={[0.028, 16]} />
        <meshBasicMaterial color={glow.flame} toneMapped={false} />
      </mesh>
      <mesh position-z={0.02}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial map={halo} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}
