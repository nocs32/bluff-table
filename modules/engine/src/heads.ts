// Where everyone sits, and where their heads point (spec §7.1, §9.2).
//
// Everyone sees the table from their own place: you at the near edge (angle 0), the others round the
// far side in the order they sat down. Angles go round the table in degrees, so 180 is straight
// across. Each layout differs (you're always at 0), but the order round the table is the same for
// everyone, which is what makes heads agree between screens.
//
// A look travels as `x` from -1 to 1: the place round the table someone looks at, from their own
// seat (angle 180 + 180·x). Each screen turns it into the same spot in its own layout: between the
// same two people, the same share of the way.

// The five places across the table, for a table of six (spec D9): the far corners, the sides and
// straight across.
export const seatSlots = [112, 146, 180, 214, 248] as const;

// Which places the others take, by how many there are (spec §9.2): across first, then the sides,
// then the far corners, so a small table never leaves a gap in the middle of the view.
const slotsByCount: Record<number, number[]> = {
  0: [],
  1: [180],
  2: [146, 214],
  3: [112, 180, 248],
  4: [112, 146, 214, 248],
  5: [...seatSlots],
};

// Places for more than five others (a spectator's view of a full table): spread evenly.
const spread = (count: number): number[] =>
  Array.from({ length: count }, (_, index) => seatSlots[0] + ((seatSlots[4] - seatSlots[0]) * index) / Math.max(1, count - 1));

const slotsFor = (count: number): number[] => slotsByCount[count] ?? spread(count);

// Each member's angle round the table, as `viewerId` sees it. Someone not at the table (or not yet)
// sees everyone across it.
export const tableLayout = (memberIds: readonly string[], viewerId: string): Map<string, number> => {
  const at = memberIds.indexOf(viewerId);
  const others = at < 0 ? [...memberIds] : [...memberIds.slice(at + 1), ...memberIds.slice(0, at)];
  const slots = slotsFor(others.length);
  const layout = new Map<string, number>(others.map((id, index) => [id, slots[index] ?? 180]));

  if (at >= 0) layout.set(viewerId, 0);

  return layout;
};

const clampUnit = (value: number): number => Math.max(-1, Math.min(1, value));

// The look that points at `angle` round the table from your own seat.
export const lookAtAngle = (angle: number): number => clampUnit((angle - 180) / 180);

// The angle a look points at, from the looker's own seat.
export const angleOfLook = (x: number): number => 180 + 180 * clampUnit(x);

// The look that points `memberId`'s head at `targetId`, in `memberId`'s own layout.
export const lookAtMember = (memberIds: readonly string[], memberId: string, targetId: string): number =>
  lookAtAngle(tableLayout(memberIds, memberId).get(targetId) ?? 180);

interface Mark {
  id: string;
  angle: number;
}

// The two people a look falls between, going round the looker's table, and how far along it is.
const bracket = (layout: Map<string, number>, lookerId: string, angle: number): { from: Mark; to: Mark; share: number } => {
  const marks = [...layout.entries()].map(([id, at]) => ({ id, angle: at })).sort((one, other) => one.angle - other.angle);
  const ring = [...marks, { id: lookerId, angle: 360 }];
  const index = Math.max(0, ring.findIndex((mark) => mark.angle >= angle) - 1);
  const from = ring[index] ?? { id: lookerId, angle: 0 };
  const to = ring[index + 1] ?? { id: lookerId, angle: 360 };
  const span = to.angle - from.angle;

  return { from, to, share: span > 0 ? (angle - from.angle) / span : 0 };
};

// Where `lookerId`'s look `x` points, as an angle round the table in `viewerId`'s layout: between
// the same two people, the same share of the way.
export const lookOnTable = (memberIds: readonly string[], lookerId: string, x: number, viewerId: string): number => {
  const theirs = tableLayout(memberIds, lookerId);

  if (!theirs.has(lookerId)) return 180;

  const { from, to, share } = bracket(theirs, lookerId, angleOfLook(x));
  const mine = tableLayout(memberIds, viewerId);
  const start = mine.get(from.id) ?? 0;
  let end = mine.get(to.id) ?? 0;

  if (end <= start) end += 360;

  return (start + (end - start) * share) % 360;
};
