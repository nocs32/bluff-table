import {
  applyMove,
  botMove,
  botPersonalities,
  gameSummary,
  nextRound,
  publicEvents,
  roundSnapshot,
  seatStates,
  seatView,
  secretsFor,
  startGame,
  timeoutMove,
  type BotPersonality,
  type GameEvent,
  type GameState,
  type Move,
} from '@bluff-table/engine';
import { gameLimits, gamePace, noSecrets, revealMs, type FeedEvent, type GamePhase, type GameSettings, type MatchSnapshot, type PlayEvent, type RoundStep, type SecretSnapshot, type TableErrorCode } from '@bluff-table/protocol';
import { DemoPlans } from './plans';
import type { DemoDeps, DemoMember } from './types';

export interface DemoGameHost {
  members: () => readonly DemoMember[];
  settings: () => GameSettings;
  system: (memberId: string, event: FeedEvent) => void;
  // A game won: the winner's bounty goes up; returns their new bounty.
  win: (memberId: string) => number;
  // Something happened at the table: everyone hears about it, and what just happened.
  changed: (events: readonly PlayEvent[]) => void;
}

type Holder = Pick<DemoMember, 'name' | 'color' | 'character'>;

// Two timeouts in a row and a bot plays your seat until you move again (spec §4.5).
const timeoutsBeforeStandIn = 2;

// A bot playing for someone still at the table waits this much longer, so they can take their seat
// back, as at a live table.
const standInWaitMs = 4000;

// The game at the demo table, as the server plays it (spec §10.3): the engine's rules, and the
// pace around them (the turn clock, the cards flipping, the gun's 10 seconds, the beat before the
// click or the bang, the pause between rounds). Sample players and bots play their seats with the
// thinking bot (spec §6), and so does anyone who leaves mid-game.
export class DemoGame {
  phase: GamePhase = 'lobby';
  state: GameState | null = null;
  step: RoundStep = 'turn';
  endsAt = 0;
  readonly #holders = new Map<string, Holder>();
  readonly #standIns = new Set<string>();
  readonly #timeouts = new Map<string, number>();
  readonly #brains = new Map<string, BotPersonality>();
  readonly #deps: DemoDeps;
  readonly #host: DemoGameHost;
  readonly #plans: DemoPlans<'clock' | 'bot'>;

  constructor(deps: DemoDeps, host: DemoGameHost) {
    this.#deps = deps;
    this.#host = host;
    this.#plans = new DemoPlans(deps.schedule);
  }

  start(memberId: string): TableErrorCode | null {
    if (this.phase === 'round') return 'WRONG_PHASE';

    const members = this.#host.members().slice(0, gameLimits.maxPlayers);

    if (members.length < gameLimits.minPlayers) return 'NOT_ENOUGH_PLAYERS';

    this.#seat(members);
    this.#host.system(memberId, { type: 'gameStarted' });

    const { state, events } = startGame({ seats: members.map((member) => member.id), switches: this.#host.settings().switches, random: this.#deps.random });

    this.phase = 'round';
    this.state = state;
    this.#settle(events);

    return null;
  }

  // A play or a call, by a person.
  move(seat: string, move: Move): TableErrorCode | null {
    if (this.phase !== 'round' || this.step !== 'turn') return 'WRONG_PHASE';

    const error = this.#apply(seat, move, []);

    if (!error) this.#acted(seat);

    return error;
  }

  // A person presses Pull the trigger.
  pull(seat: string): TableErrorCode | null {
    if (this.step !== 'pull' || this.state?.step.kind !== 'pull') return 'WRONG_PHASE';

    if (this.state.step.seat !== seat) return 'NOT_YOUR_TURN';

    this.#acted(seat);
    this.#press(seat, false);

    return null;
  }

  playAgain(memberId: string): TableErrorCode | null {
    return this.phase === 'over' ? this.start(memberId) : 'WRONG_PHASE';
  }

  toLobby(): TableErrorCode | null {
    if (this.phase !== 'over') return 'WRONG_PHASE';

    this.#plans.cancelAll();
    this.phase = 'lobby';
    this.state = null;

    return null;
  }

  // Someone left mid-game: a bot plays their seat from now on (spec §4.5).
  leave(memberId: string): void {
    if (!this.state?.seats.includes(memberId) || this.#standIns.has(memberId)) return;

    this.#standIns.add(memberId);
    this.#wakeBot();
  }

  snapshot(): MatchSnapshot | null {
    const state = this.state;

    if (this.phase === 'lobby' || !state) return null;

    const seats = seatStates(state).map((seat) => ({ ...seat, ...this.#holder(seat.id), standIn: this.#standIns.has(seat.id) }));

    return { deckSize: state.deck.length, seats, round: roundSnapshot(state, this.step, this.endsAt), summary: gameSummary(state) };
  }

  secret(memberId: string): SecretSnapshot {
    return this.state && this.phase !== 'lobby' ? secretsFor(this.state, memberId) : noSecrets;
  }

  dispose(): void {
    this.#plans.cancelAll();
  }

  #seat(members: readonly DemoMember[]): void {
    this.#holders.clear();
    this.#standIns.clear();
    this.#timeouts.clear();

    members.forEach(({ id, name, color, character }) => {
      this.#holders.set(id, { name, color, character });
      this.#brains.set(id, botPersonalities[Math.floor(this.#deps.random() * botPersonalities.length)] ?? 'honest');
    });
  }

  #holder(id: string): Holder {
    const member = this.#host.members().find((other) => other.id === id);

    return member ? { name: member.name, color: member.color, character: member.character } : (this.#holders.get(id) ?? { name: '', color: 'teal', character: { hat: 'none', face: 'clean', hair: 'short', scar: 'none', straw: false, hairTone: 'brown', coat: 'tan' } });
  }

  #isBot(seat: string): boolean {
    const member = this.#host.members().find((other) => other.id === seat);

    return !member || member.bot || member.sample || this.#standIns.has(seat);
  }

  #apply(seat: string, move: Move, extra: PlayEvent[]): TableErrorCode | null {
    if (!this.state) return 'WRONG_PHASE';

    const result = applyMove(this.state, seat, move, this.#deps.random);

    if (!result.ok) return result.error;

    this.state = result.state;
    this.#settle(result.events, extra);

    return null;
  }

  // After every change: the next step, its clock, and a bot's move if it's theirs. Then everyone
  // hears what happened.
  #settle(events: readonly GameEvent[], extra: PlayEvent[] = []): void {
    const step = this.state?.step;

    this.#plans.cancelAll();
    this.#announce(events);

    if (step?.kind === 'turn') this.#turn();
    else if (step?.kind === 'pull') this.#gunComing(events);
    else if (step?.kind === 'roundOver') this.#roundOver(events);
    else if (step?.kind === 'over') this.#finish(step.winner);

    this.#host.changed([...extra, ...publicEvents(events)]);
  }

  #stage(step: RoundStep, ms: number, then: () => void): void {
    this.step = step;
    this.endsAt = this.#deps.now() + ms;
    this.#plans.later('clock', ms, then);
  }

  #between({ min, max }: { min: number; max: number }): number {
    return min + this.#deps.random() * (max - min);
  }

  #turn(): void {
    this.#stage('turn', this.#host.settings().turnSeconds * 1000, () => this.#timeout());
    this.#wakeBot();
  }

  // A bot whose turn (or gun) it is gets going after a think.
  #wakeBot(): void {
    const state = this.state;

    if (!state) return;

    if (state.step.kind === 'pull' && this.step === 'pull' && this.#isBot(state.step.seat)) {
      const seat = state.step.seat;

      this.#plans.later('bot', this.#waitFor(seat) + this.#between(gamePace.botPullMs), () => this.#press(seat, false));
    }

    if (state.step.kind === 'turn' && this.#isBot(state.round.turn)) this.#plans.later('bot', this.#waitFor(state.round.turn) + this.#between(gamePace.botThinkMs), () => this.#botMove());
  }

  // Someone a bot stands in for who's still here gets a few seconds to move themselves.
  #waitFor(seat: string): number {
    const member = this.#host.members().find((other) => other.id === seat);

    return member && !member.bot && !member.sample ? standInWaitMs : 0;
  }

  #botMove(): void {
    const state = this.state;

    if (!state || state.step.kind !== 'turn') return;

    const seat = state.round.turn;

    this.#apply(seat, botMove(seatView(state, seat), this.#brains.get(seat) ?? 'honest', this.#deps.random), []);
  }

  #timeout(): void {
    const timeout = this.state ? timeoutMove(this.state, this.#deps.random) : null;

    if (!timeout) return;

    this.#timedOut(timeout.seat);
    this.#apply(timeout.seat, timeout.move, [{ type: 'timedOut', seat: timeout.seat, step: 'turn' }]);
  }

  // A person ran out of time: twice in a row, and a bot plays for them.
  #timedOut(seat: string): void {
    const count = (this.#timeouts.get(seat) ?? 0) + 1;

    this.#timeouts.set(seat, count);

    if (count >= timeoutsBeforeStandIn) this.#standIns.add(seat);
  }

  // A person moved themselves: they're back.
  #acted(seat: string): void {
    this.#timeouts.delete(seat);
    this.#standIns.delete(seat);
  }

  // Someone has to pull: first the called cards flip, one at a time; then the gun's out.
  #gunComing(events: readonly GameEvent[]): void {
    const flipped = events.find((event) => event.type === 'revealed');

    if (!flipped) {
      this.#gunOut();

      return;
    }

    this.#stage('reveal', revealMs(flipped.cards.length), () => {
      this.#gunOut();
      this.#host.changed([]);
    });
  }

  #gunOut(): void {
    const step = this.state?.step;

    if (step?.kind !== 'pull') return;

    this.#stage('pull', gamePace.pullMs, () => {
      this.#timedOut(step.seat);
      this.#press(step.seat, true);
    });

    this.#wakeBot();
  }

  // The trigger's pressed: a random beat, then the click or the bang (spec §5.6).
  #press(seat: string, timedOut: boolean): void {
    if (this.step !== 'pull') return;

    this.#plans.cancelAll();
    this.#stage('pulling', this.#between(gamePace.beatMs), () => this.#apply(seat, { type: 'pull' }, []));
    this.#host.changed([...(timedOut ? [{ type: 'timedOut', seat, step: 'pull' } as const] : []), { type: 'pulling', seat }]);
  }

  #roundOver(events: readonly GameEvent[]): void {
    const bang = events.some((event) => event.type === 'pulled' && event.bang);

    this.#stage('roundOver', bang ? gamePace.afterBangMs : gamePace.afterClickMs, () => {
      const next = this.state ? nextRound(this.state, this.#deps.random) : null;

      if (!next) return;

      this.state = next.state;
      this.#settle(next.events);
    });
  }

  #finish(winner: string): void {
    this.phase = 'over';
    this.step = 'roundOver';
    this.endsAt = 0;
    this.#host.system(winner, { type: 'gameWon', bounty: this.#host.win(winner) });
  }

  // The feed's lines for what happened: deaths.
  #announce(events: readonly GameEvent[]): void {
    const round = this.state?.round.number ?? 0;

    events.forEach((event) => {
      if (event.type === 'pulled' && event.bang) this.#host.system(event.seat, { type: 'died', round });
    });
  }
}
