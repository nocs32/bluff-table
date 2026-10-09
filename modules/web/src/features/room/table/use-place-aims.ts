import { useRootStore } from '../../../stores/use-root-store';
import type { PlaceView } from '../../../stores/room/seats';
import type { HeadAim } from './use-head';
import { useRoomTableSeatAim } from './use-seat-aim';

export interface PlaceAims {
  person: (time: number) => HeadAim;
  ghost: (time: number) => HeadAim;
}

// Where the person in a place looks, and where their ghost looks once they're dead.
export const useRoomTablePlaceAims = (place: PlaceView): PlaceAims => {
  const { room } = useRootStore();
  const props = { heads: room.heads, moods: room.game.moods, match: room.game.match, memberId: place.player?.id ?? '', angle: place.angle, memberIds: room.seats.order, meId: room.presence.meId };

  return { person: useRoomTableSeatAim(props), ghost: useRoomTableSeatAim({ ...props, ghost: true }) };
};
