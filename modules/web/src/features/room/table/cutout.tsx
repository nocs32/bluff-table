import type { ThreeEvent } from '@react-three/fiber';
import type { ReactElement } from 'react';
import type { CanvasTexture } from 'three';
import { useCutoutSize, type CutoutAnchor } from './use-cutout';

interface RoomTableCutoutProps {
  texture: CanvasTexture;
  // Metres across; the height follows the drawing.
  width: number;
  anchor?: CutoutAnchor;
  position?: [number, number, number];
  // Lying flat on the felt instead of standing.
  flat?: boolean;
  // Casts a shadow in the lamp's light.
  shadow?: boolean;
  // Shows its drawing as it is, whatever the light: the lamp itself.
  unlit?: boolean;
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: () => void;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
}

// One piece of the cardboard stage (spec §8.1): a drawing cut out of card, standing (or lying) in
// the scene and lit by the lamp. Only the drawing itself is there: its see-through margin takes no
// light, casts no shadow and catches no clicks.
export function RoomTableCutout({ texture, width, anchor = 'center', position = [0, 0, 0], flat = false, shadow = false, unlit = false, onPointerOver, onPointerOut, onClick }: RoomTableCutoutProps): ReactElement {
  const size = useCutoutSize(texture, width, anchor);

  return (
    <group position={position} rotation-x={flat ? -Math.PI / 2 : 0}>
      <mesh position-y={size.lift} castShadow={shadow} receiveShadow onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
        <planeGeometry args={[size.width, size.height]} />
        {unlit ? (
          <meshBasicMaterial map={texture} alphaTest={0.5} alphaToCoverage toneMapped={false} />
        ) : (
          <meshStandardMaterial map={texture} alphaTest={0.5} alphaToCoverage roughness={0.92} metalness={0} />
        )}
      </mesh>
    </group>
  );
}
