import { lookOnTable } from '@bluff-table/engine';
import { useCallback } from 'react';
import type { RoomHeadsStore } from '../../../stores/room/heads';
import { facing } from './layout';
import type { HeadAim } from './use-head';

interface SeatAimProps {
  heads: RoomHeadsStore;
  memberId: string;
  angle: number;
  // Everyone at the table in the order they sat down, and you: a look is passed on between them.
  memberIds: readonly string[];
  meId: string;
}

// Where the person in a seat looks, as drawn on your screen (spec §7.1): their look, smoothed on
// springs, turned into the same spot round your table, and their head turned towards it.
export const useRoomTableSeatAim = ({ heads, memberId, angle, memberIds, meId }: SeatAimProps): ((time: number) => HeadAim) =>
  useCallback(() => {
    const springs = heads.head(memberId);
    const target = lookOnTable(memberIds, memberId, springs.x.value, meId);

    return { x: facing(angle, target), y: springs.y.value, mood: heads.moodOf(memberId) };
  }, [heads, memberId, angle, memberIds, meId]);
