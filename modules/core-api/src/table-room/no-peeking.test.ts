import { noSecrets, type TableViewEvent } from '@bluff-table/protocol';
import { expect, test } from 'vitest';
import { all, joinOptions, latest, listen, sitDown, until, useTestRoom, type Logged, type Seat } from './test-room.js';

// Games played through a real room (port 2595; the lobby test uses 2594), and the checks from spec
// §11 (D24): a living player is never sent a card from another hand unless a Liar! flipped it;
// nobody but the whispered player learns the house before the round ends; nobody is ever sent where
// a bullet is; ghosts get every hand, and spectators get nothing private.
const room = useTestRoom(2595);

const viewOf = (logged: Logged): TableViewEvent | null => (logged.type === 'view' ? (logged.payload as TableViewEvent) : null);

// One step of a quick player: open with a card, call Liar! (×2 while it can) on anything else, and
// pull the trigger as soon as the gun is out.
const act = (seat: Seat, pulled: Set<string>): void => {
  const view = latest(seat, 'view');
  const round = view?.game.match?.round;
  const me = seat.room.sessionId;
  const mine = view?.game.match?.seats.find((one) => one.id === me);

  if (!view || !round || view.game.phase !== 'round' || round.turn !== me) return;

  if (round.step === 'pull' && round.puller?.seat === me && !pulled.has(`${round.endsAt}`)) {
    pulled.add(`${round.endsAt}`);
    seat.room.send('pull', {});
  }

  if (round.step !== 'turn') return;

  const card = view.secret.hand?.[0];

  if (round.opening && card) seat.room.send('play', { cardIds: [card.id] });
  else if (!round.opening) seat.room.send('call', { double: mine?.doubleUsed === false });
};

const autoPlay = (seat: Seat): (() => void) => {
  const pulled = new Set<string>();
  let seen = 0;

  const timer = setInterval(() => {
    if (seat.log.length === seen) return;

    seen = seat.log.length;
    act(seat, pulled);
  }, 25);

  return () => clearInterval(timer);
};

// What a message shows of the cards once the allowed faces are taken out: your own hand, and the
// cards a Liar! flipped (public from then on). Anything with a rank left over is a peek.
const withoutAllowed = (logged: Logged): unknown => {
  const view = viewOf(logged);

  if (view) {
    const round = view.game.match?.round;

    return { ...view, secret: { ...view.secret, hand: null }, game: { ...view.game, match: view.game.match && { ...view.game.match, round: round && { ...round, revealed: null } } } };
  }

  if (logged.type === 'play') return (logged.payload as { events: Array<{ type: string }> }).events.filter((event) => event.type !== 'revealed');

  return logged.payload;
};

// Everything a player was sent while alive: up to the first view that shows them dead.
const whileAlive = (seat: Seat): Logged[] => {
  const diedAt = seat.log.findIndex((logged) => viewOf(logged)?.game.match?.seats.some((one) => one.id === seat.room.sessionId && !one.alive));

  return diedAt < 0 ? seat.log : seat.log.slice(0, diedAt);
};

// Your hand holds just your cards: as many as everyone sees you hold.
const handFits = (seat: Seat, logged: Logged): boolean => {
  const view = viewOf(logged);
  const hand = view?.secret.hand;

  return !hand || hand.length === view.game.match?.seats.find((one) => one.id === seat.room.sessionId)?.cards;
};

const peeks = (seat: Seat, log: readonly Logged[]): string[] =>
  log.filter((logged) => !handFits(seat, logged) || JSON.stringify(withoutAllowed(logged)).includes('"rank":')).map((logged) => logged.type);

// The house, shown to someone who wasn't whispered to before the round ended.
const housePeeks = (seat: Seat): number =>
  all(seat, 'view').filter((view) => {
    const round = view.game.match?.round;
    const early = round?.house && round.step !== 'roundOver';
    const told = view.secret.crooked !== null && round?.whispered !== seat.room.sessionId;

    return Boolean(early) || told;
  }).length;

const deadIn = (seat: Seat): string[] => latest(seat, 'view')?.game.match?.seats.filter((one) => !one.alive).map((one) => one.id) ?? [];

test('three people play through the room with a spectator watching, and nobody peeks', async () => {
  const players = (await sitDown(room, 3)) as [Seat, Seat, Seat];
  const [ana, bo] = players;

  ana.room.send('updateSettings', { switches: { whisper: true, doubleCall: true } });
  await until(() => latest(bo, 'view')?.game.settings.switches.doubleCall === true);
  bo.room.send('start', {});
  await until(() => latest(ana, 'view')?.game.phase === 'round');

  const dee = listen(await room.colyseus().sdk.joinById(ana.room.roomId, joinOptions('Dee')));
  const stops = players.map((seat) => autoPlay(seat));
  const round = (): number => latest(ana, 'view')?.game.match?.round?.number ?? 0;
  let deathRound = Infinity;

  // Until the game is over, or the round after the first death is dealt (a ghost sees it).
  await until(() => {
    if (deadIn(ana).length > 0) deathRound = Math.min(deathRound, round());

    return latest(ana, 'view')?.game.phase === 'over' || round() > deathRound;
  }, 110_000);

  stops.forEach((stop) => stop());

  const ghosts = players.filter((seat) => deadIn(ana).includes(seat.room.sessionId));
  const living = players.filter((seat) => !ghosts.includes(seat));
  const ghostView = ghosts[0] && latest(ghosts[0], 'view');

  expect(ghosts.length).toBeGreaterThan(0);
  players.forEach((seat) => expect(peeks(seat, whileAlive(seat))).toEqual([]));
  expect(peeks(dee, dee.log)).toEqual([]);
  expect(all(dee, 'view').every((view) => JSON.stringify(view.secret) === JSON.stringify(noSecrets))).toBe(true);
  [...players, dee].forEach((seat) => expect(housePeeks(seat)).toBe(0));
  [...players, dee].forEach((seat) => expect(JSON.stringify(seat.log)).not.toMatch(/bullet/u));
  expect(Object.keys(ghostView?.secret.ghost?.hands ?? {}).sort()).toEqual(living.map((seat) => seat.room.sessionId).sort());
  expect(all(ana, 'play').flatMap(({ events }) => events).some((event) => event.type === 'dealt' && event.whispered)).toBe(true);
}, 120_000);

test('a reload mid-game keeps your seat, your hand and your cylinder', async () => {
  const [ana, bo] = (await sitDown(room, 2)) as [Seat, Seat];

  ana.room.send('start', {});
  await until(() => latest(bo, 'view')?.secret.hand?.length === 5);

  const hand = latest(bo, 'view')?.secret.hand;
  const token = bo.room.reconnectionToken;

  await bo.room.leave(false);

  const back = listen(await room.colyseus().sdk.reconnect(token));

  await until(() => latest(back, 'view') !== undefined);
  expect(latest(back, 'view')?.secret.hand).toEqual(hand);
  expect(latest(back, 'view')?.game.match?.seats.find((seat) => seat.id === bo.room.sessionId)).toMatchObject({ alive: true, used: 0, standIn: false });
});

test('someone who joins mid-game watches, and can’t make a move', async () => {
  const [ana] = (await sitDown(room, 1)) as [Seat];

  ana.room.send('addBot', {});
  await until(() => latest(ana, 'view')?.members.length === 2);
  ana.room.send('start', {});
  await until(() => latest(ana, 'view')?.game.phase === 'round');

  const bo = listen(await room.colyseus().sdk.joinById(ana.room.roomId, joinOptions('Bo')));

  await until(() => latest(bo, 'view')?.game.phase === 'round');
  expect(latest(bo, 'view')?.game.match?.seats.map((seat) => seat.id)).not.toContain(bo.room.sessionId);
  bo.room.send('call', { double: false });
  await until(() => latest(bo, 'error')?.code === 'NOT_PLAYING');
});
