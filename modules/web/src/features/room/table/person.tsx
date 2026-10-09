import type { Character, PlayerColor } from '@bluff-table/protocol';
import type { ReactElement } from 'react';
import { bustSize } from './layout';
import { useRoomTableHead, type HeadAim } from './use-head';
import { useBodyTexture } from './use-textures';

interface RoomTablePersonProps {
  character: Character;
  color: PlayerColor;
  apron?: boolean;
  // Where the bottom of the bust stands.
  position: [number, number, number];
  // Where the head looks and the face it pulls, read every frame.
  aim: (time: number) => HeadAim;
}

// A person as an ink cut-out bust (spec §8.3): the body on one plane and the head just in front of
// it on another, so the head turns without redrawing the rest.
export function RoomTablePerson({ character, color, apron = false, position, aim }: RoomTablePersonProps): ReactElement {
  const body = useBodyTexture(character, color, apron);
  const head = useRoomTableHead(character, color, apron, aim);

  return (
    <group position={position}>
      <mesh position-y={bustSize.middle} castShadow>
        <planeGeometry args={[bustSize.width, bustSize.height]} />
        <meshStandardMaterial map={body} alphaTest={0.5} alphaToCoverage roughness={0.92} />
      </mesh>
      <mesh position={[0, bustSize.middle, 0.005]} castShadow>
        <planeGeometry args={[bustSize.width, bustSize.height]} />
        <meshStandardMaterial map={head} alphaTest={0.5} alphaToCoverage roughness={0.92} />
      </mesh>
    </group>
  );
}
