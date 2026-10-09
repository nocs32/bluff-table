import { useMemo } from 'react';
import { seatLift, seatPoint, stage } from './layout';

type Point = [number, number, number];

export interface PlaceSpots {
  person: Point;
  // Just behind the person, from where you sit.
  chair: Point;
  // On the felt in front of them.
  tag: Point;
}

// Where the chair, the person and the name tag of the place at `angle` stand.
export const useRoomTablePlace = (angle: number): PlaceSpots =>
  useMemo((): PlaceSpots => {
    const seat = seatPoint(angle);
    const lift = seatLift(angle);
    const inward = 0.8;

    return {
      person: [seat.x, stage.bust.bottom + lift, seat.z],
      chair: [seat.x * 1.02, stage.bust.bottom - 0.24 + lift, seat.z - 0.14],
      tag: [seat.x * inward, 0, seat.z * inward + 0.1],
    };
  }, [angle]);
