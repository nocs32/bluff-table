import { figureBox, headInBox, lampFlame, lampSize } from '../../../art';

// Where everything stands on the cardboard stage (spec §8.1, §8.7), in metres. The felt's top is at
// y = 0 and its middle at the origin; you sit at the near edge (+z), the camera just behind you.

export const stage = {
  floorY: -0.86,
  // The oval card table: the felt and its rim.
  table: { rx: 2.05, rz: 1.45 },
  // Where the people across the table stand: just behind the rim.
  seats: { rx: 1.92, rz: 1.62 },
  // A bust's drawing box, in metres tall, and how far below the felt its bottom goes.
  bust: { height: 1.32, bottom: -0.08 },
  wall: { z: -4.4, width: 20, height: 7.2 },
  bar: { x: -2.75, counterZ: -3.25, keeperZ: -3.75, keeperX: -2.15 },
  doors: { x: 3.55, width: 1.6 },
  // The lamp hangs from the ceiling over the middle of the table: `y` is its top, where it hangs
  // from its rod.
  lamp: { x: 0, y: 2.2, z: -0.2, width: 0.4, ceiling: 5.4 },
  // Looking down across the table from your chair, so the felt reads as an oval, as in the sketches.
  camera: { fov: 38, target: { x: 0, y: 0.42, z: -0.6 }, pitch: 0.4 },
} as const;

// The table top's drawing is a little wider than the oval itself (its cut-out edge), and the card
// it's cut from has a thickness.
export const tableTop = { width: stage.table.rx * 2 * 1.03, thickness: 0.07 } as const;

// Where the felt ends inside the wooden rim (the drawing in art/saloon/table.ts): things lying on
// the table keep inside it.
export const feltOval = { rx: 1.7, rz: 0.92 } as const;

// The table's wooden apron round its edge, and its legs down to the floor: the near ones show under
// the rim, so the table stands at chair height instead of lying on the floor.
export const tableBase = {
  apron: 0.17,
  legWidth: 0.18,
  legs: [
    [-1.25, 0.95],
    [1.25, 0.95],
    [-1.75, -0.2],
    [1.75, -0.2],
  ] as ReadonlyArray<[number, number]>,
} as const;

// The lamp hangs on a long rod from a pivot up in the dark, so a swing carries it across the table.
// `flame` is how far below the lamp's top its flame burns.
export const lampHang = {
  pivot: [stage.lamp.x, stage.lamp.ceiling, stage.lamp.z] as [number, number, number],
  rod: stage.lamp.ceiling - stage.lamp.y,
  width: stage.lamp.width,
  flame: stage.lamp.width * (lampSize.height / lampSize.width) * lampFlame.y,
} as const;

// The swinging doors' two leaves: hinged inside the doorway's frame, hanging at waist height.
export const doorLeaf = {
  hinge: stage.doors.width * 0.36,
  width: stage.doors.width * 0.36,
  bottom: 0.55,
} as const;

// Where the wanted posters are pinned, between the bar's shelves and the doors.
export const posterSpots: ReadonlyArray<[number, number, number]> = [0.9, 1.7, 2.5, -5.2].map((x) => [x, stage.floorY + 2.05, stage.wall.z + 0.06]);

// The top of the bar's counter, where the tent cards stand.
export const counterTop = stage.floorY + 1.18;

// A bust's planes: its drawing box in metres, and how high its middle is above its bottom edge.
export const bustSize = {
  width: (stage.bust.height * figureBox.width) / figureBox.height,
  height: stage.bust.height,
  middle: stage.bust.height / 2,
} as const;

// How high a bust's head is above its bottom edge.
export const headHeight = stage.bust.height * (1 - headInBox.y);

const radians = (degrees: number): number => (degrees * Math.PI) / 180;

export interface StagePoint {
  x: number;
  z: number;
}

// The place at `angle` round the table (0 is you, 180 straight across): seats to your left at
// angles under 180 are on the left of the screen.
export const seatPoint = (angle: number): StagePoint => ({ x: -Math.sin(radians(angle)) * stage.seats.rx, z: Math.cos(radians(angle)) * stage.seats.rz });

// Far seats stand a little higher, so every head stays readable (spec §9.2).
export const seatLift = (angle: number): number => Math.max(0, -Math.cos(radians(angle))) * 0.1;

// Where you are, for heads that look at you: the camera's side of the table.
export const youPoint: StagePoint = { x: 0, z: stage.table.rz + 2.2 };

// Where a look at `angle` round the table lands: someone's place, or, on your side of the table,
// towards you.
const lookPoint = (angle: number): StagePoint => {
  const place = seatPoint(angle);
  const near = Math.max(0, Math.cos(radians(angle)));

  return { x: place.x * (1 - near), z: place.z + near * (youPoint.z - place.z) };
};

const clampUnit = (value: number): number => Math.max(-1, Math.min(1, value));

// How the head of someone at `seatAngle` looks on your screen when they look at `targetAngle`
// round the table (spec §7.1): straight out at you when they look at you, turned towards whoever
// they look at. -1 is fully to the left of the screen, 1 fully to the right.
export const facing = (seatAngle: number, targetAngle: number): number => {
  const seat = seatPoint(seatAngle);
  const target = lookPoint(targetAngle);
  const toYou = { x: youPoint.x - seat.x, z: youPoint.z - seat.z };
  const toTarget = { x: target.x - seat.x, z: target.z - seat.z };
  const turn = Math.atan2(toYou.x * toTarget.z - toYou.z * toTarget.x, toYou.x * toTarget.x + toYou.z * toTarget.z);

  return clampUnit(-turn / (Math.PI / 2));
};
