import { lookOnTable } from '@bluff-table/engine';
import { useCallback } from 'react';
import type { RoomGameMatchStore } from '../../../stores/room/game/match';
import type { RoomGameMoodsStore } from '../../../stores/room/game/moods';
import type { RoomHeadsStore } from '../../../stores/room/heads';
import { facing } from './layout';
import type { HeadAim } from './use-head';

interface SeatAimProps {
  heads: RoomHeadsStore;
  moods: RoomGameMoodsStore;
  match: RoomGameMatchStore;
  memberId: string;
  angle: number;
  // Everyone round the table in order, and you: a look is passed on between them.
  memberIds: readonly string[];
  meId: string;
  // Their ghost, floating over the chair (spec §5.7): it keeps the head, not the cards or the gun.
  ghost?: boolean;
}

// Where the person in a seat looks, as drawn on your screen (spec §7.1): their look, smoothed on
// springs, turned into the same spot round your table, and their head turned towards it; with the
// face they pull and what they hold.
export const useRoomTableSeatAim = ({ heads, moods, match, memberId, angle, memberIds, meId, ghost = false }: SeatAimProps): ((time: number) => HeadAim) =>
  useCallback(() => {
    const springs = heads.head(memberId);
    const target = lookOnTable(memberIds, memberId, springs.x.value, meId);
    const pose = ghost ? { cards: 0, gun: false } : match.poseOf(memberId);

    return { x: facing(angle, target), y: springs.y.value, mood: moods.moodOf(memberId, ghost), ...pose };
  }, [heads, moods, match, memberId, angle, memberIds, meId, ghost]);
