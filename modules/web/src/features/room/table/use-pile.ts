import { createRandom } from '@bluff-table/engine';
import type { PlaySize } from '@bluff-table/protocol';
import { useMemo } from 'react';
import { feltOval, seatPoint } from './layout';

type Point = [number, number, number];

// One face-down card on the pile: where it lands, how it's turned, and where it came from (its
// player's place).
export interface PileCardSpot {
  key: string;
  to: Point;
  turn: number;
  from: Point;
}

// The pile sits in front of the table card, a little scattered, each card a hair above the last.
const pile = { x: 0, z: 0.3, spreadX: 0.16, spreadZ: 0.1, lift: 0.0016 };

// Where a card thrown from the place at `angle` starts: on the felt in front of them, or yours at
// the near edge.
const startOf = (angle: number): Point => {
  if (angle === 0) return [0, 0.25, feltOval.rz + 0.3];

  const seat = seatPoint(angle);

  return [seat.x * 0.75, 0.25, seat.z * 0.75];
};

// Every card on the pile but the flipped play's (those stand up to be read), with where it lies.
// The same play always lands in the same place on every screen.
export const useRoomTablePile = (plays: readonly PlaySize[], flipped: number | null, layout: Map<string, number>): PileCardSpot[] =>
  useMemo((): PileCardSpot[] => {
    const spots: PileCardSpot[] = [];

    plays.forEach((play, playIndex) => {
      for (let card = 0; card < play.count; card++) {
        const random = createRandom(playIndex * 7 + card + 1);
        const at = spots.length;

        if (playIndex !== flipped) spots.push({ key: `${playIndex}-${card}`, to: [pile.x + (random() - 0.5) * 2 * pile.spreadX, 0.004 + at * pile.lift, pile.z + (random() - 0.5) * 2 * pile.spreadZ], turn: (random() - 0.5) * 1.4, from: startOf(layout.get(play.seat) ?? 180) });
      }
    });

    return spots;
  }, [plays, flipped, layout]);
