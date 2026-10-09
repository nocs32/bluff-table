import type { Character, PlayerColor } from '@bluff-table/protocol';
import type { ReactElement } from 'react';
import { bustSize } from './layout';
import { useRoomTableHead, type HeadAim } from './use-head';
import { useRoomTableSlump } from './use-slump';
import { useBodyTexture } from './use-textures';

interface RoomTablePersonProps {
  character: Character;
  color: PlayerColor;
  apron?: boolean;
  // A ghost, floating over its chair (spec §5.7).
  ghost?: boolean;
  // Shot: slumped across the table.
  dead?: boolean;
  // Where the bottom of the bust stands.
  position: [number, number, number];
  // Where the head looks and the face it pulls, read every frame.
  aim: (time: number) => HeadAim;
}

// A person as an ink cut-out bust (spec §8.3): the body on one plane and the head just in front of
// it on another, so the head turns without redrawing the rest. Shot, the bust falls forward onto the
// table (spec D20).
export function RoomTablePerson({ character, color, apron = false, ghost = false, dead = false, position, aim }: RoomTablePersonProps): ReactElement {
  const body = useBodyTexture(character, color, apron, ghost);
  const head = useRoomTableHead({ character, color, apron, ghost }, aim);
  const slump = useRoomTableSlump(dead);

  return (
    <group position={position}>
      <group ref={slump}>
        <mesh position-y={bustSize.middle} castShadow={!ghost}>
          <planeGeometry args={[bustSize.width, bustSize.height]} />
          <meshStandardMaterial map={body} alphaTest={ghost ? 0.05 : 0.5} alphaToCoverage={!ghost} transparent={ghost} opacity={ghost ? 0.82 : 1} depthWrite={!ghost} roughness={0.92} />
        </mesh>
        <mesh position={[0, bustSize.middle, 0.005]} castShadow={!ghost}>
          <planeGeometry args={[bustSize.width, bustSize.height]} />
          <meshStandardMaterial map={head} alphaTest={ghost ? 0.05 : 0.5} alphaToCoverage={!ghost} transparent={ghost} opacity={ghost ? 0.82 : 1} depthWrite={!ghost} roughness={0.92} />
        </mesh>
      </group>
    </group>
  );
}
