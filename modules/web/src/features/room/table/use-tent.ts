import { useMemo } from 'react';
import { stage } from './layout';

// How far apart the tent cards stand, side by side.
const spacing = 0.7;

// The tent cards stand in a row on the far side of the felt, facing you, in front of the people
// across the table.
export const useRoomTableTentSpot = (index: number, count: number): [number, number, number] =>
  useMemo((): [number, number, number] => [(index - (count - 1) / 2) * spacing, 0, -stage.table.rz * 0.5], [index, count]);
