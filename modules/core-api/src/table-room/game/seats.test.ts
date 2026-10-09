import { expect, test } from 'vitest';
import { TableRoomGameSeats } from './seats.js';

const createSeats = (): TableRoomGameSeats => {
  const seats = new TableRoomGameSeats();
  const holder = (id: string): Parameters<TableRoomGameSeats['seat']>[0][number] => ({ id, name: id.toUpperCase(), color: 'teal', character: { hat: 'none', face: 'clean', hair: 'short', scar: 'none', straw: false, hairTone: 'brown', coat: 'tan' } });

  seats.seat([holder('a'), holder('b')]);

  return seats;
};

test('two timeouts in a row and a bot stands in; a move of their own takes the seat back', () => {
  const seats = createSeats();

  seats.timedOut('a');
  expect(seats.standIns.has('a')).toBe(false);

  seats.timedOut('a');
  expect(seats.standIns.has('a')).toBe(true);

  seats.acted('a');
  seats.timedOut('a');
  expect(seats.standIns.has('a')).toBe(false);
});

test('someone who leaves is stood in for, and keeps their name; a stranger has no seat', () => {
  const seats = createSeats();

  seats.dropOut('b');
  seats.dropOut('stranger');

  expect([...seats.standIns]).toEqual(['b']);
  expect(seats.holder('b').name).toBe('B');
  expect(seats.has('stranger')).toBe(false);
});

test('a new game starts everyone afresh', () => {
  const seats = createSeats();

  seats.dropOut('a');
  seats.timedOut('b');
  seats.clear();

  expect(seats.ids).toEqual([]);
  expect(seats.standIns.size).toBe(0);
});
