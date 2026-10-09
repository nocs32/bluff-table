import { useFrame } from '@react-three/fiber';
import type { RoomHeadsStore } from '../../../stores/room/heads';

// Every head's springs move on once a frame, before anything is drawn (spec §8.5).
export const useRoomTableHeads = (heads: RoomHeadsStore): void => {
  useFrame((_, dt) => heads.step(dt), -1);
};
