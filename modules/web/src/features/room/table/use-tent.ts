import { useMemo } from 'react';

// How far either side of the deck the tent cards stand.
const aside = 0.74;

// The tent cards stand in the middle of the felt, either side of the deck, facing you: clear of the
// name tags and the revolvers round the edge. The first goes on the left.
export const useRoomTableTentSpot = (index: number, count: number): [number, number, number] =>
  useMemo((): [number, number, number] => [count === 1 ? -aside : (index * 2 - 1) * aside, 0, 0.05], [index, count]);
