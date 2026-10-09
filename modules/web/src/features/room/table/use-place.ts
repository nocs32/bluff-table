import { useMemo } from 'react';
import { seatLift, seatPoint, stage } from './layout';

type Point = [number, number, number];

export interface PlaceSpots {
  person: Point;
  // Just behind the person, from where you sit.
  chair: Point;
  // On the felt in front of them.
  tag: Point;
  // Their ghost, floating over the chair (spec §5.7).
  ghost: Point;
  // The whisper mark over their name tag, and their whiskey shot beside it (spec §8.2).
  mark: Point;
  shot: Point;
}

// Where the chair, the person, the name tag and the little marks of the place at `angle` stand.
export const useRoomTablePlace = (angle: number): PlaceSpots =>
  useMemo((): PlaceSpots => {
    const seat = seatPoint(angle);
    const lift = seatLift(angle);
    const inward = 0.8;
    const radians = (angle * Math.PI) / 180;
    const tag: Point = [seat.x * inward, 0, seat.z * inward + 0.1];

    return {
      person: [seat.x, stage.bust.bottom + lift, seat.z],
      chair: [seat.x * 1.02, stage.bust.bottom - 0.24 + lift, seat.z - 0.14],
      tag,
      ghost: [seat.x, stage.bust.bottom + lift + 0.5, seat.z - 0.08],
      mark: [tag[0], 0.3, tag[2]],
      shot: [tag[0] - Math.cos(radians) * 0.44, 0, tag[2] - Math.sin(radians) * 0.44],
    };
  }, [angle]);
