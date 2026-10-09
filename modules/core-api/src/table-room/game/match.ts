import { applyMove, nextRound, publicEvents, roundSnapshot, startGame, timeoutMove, type GameEvent, type GameState, type Move } from '@bluff-table/engine';
import { gamePace, revealMs, type GameSwitches, type PlayEvent, type RoundSnapshot, type RoundStep } from '@bluff-table/protocol';
import { TableRoomError } from '../error.js';
import type { TableRoomGameClock } from './clock.js';

export interface TableRoomGameMatchDeps {
  clock: TableRoomGameClock;
  random: () => number;
  // The turn's time, from the settings.
  turnMs: () => number;
  // Someone ran out of time (their turn, or their gun's 10 seconds).
  timedOut: (seat: string) => void;
  died: (seat: string, round: number) => void;
  over: (winner: string) => void;
  // The clock moved the game on, with nobody asking: everyone needs to hear about it.
  changed: () => void;
}

// One game, from the deal to the winner (spec §5, §10.3): the engine's state, and the table's pace
// around it, as the demo table keeps it. The steps: turn → (reveal →) pull → pulling → roundOver →
// the next deal's turn … until one player is left. What happened is kept for the outbox.
export class TableRoomGameMatch {
  state: GameState | null = null;
  step: RoundStep = 'turn';
  #played: PlayEvent[] = [];
  readonly #deps: TableRoomGameMatchDeps;

  constructor(deps: TableRoomGameMatchDeps) {
    this.#deps = deps;
  }

  get endsAt(): number {
    return this.#deps.clock.endsAt ?? 0;
  }

  // Whose decision it is now: the player whose turn it is, or whoever has the gun out.
  get actor(): string | null {
    const state = this.state;

    if (state?.step.kind === 'turn' && this.step === 'turn') return state.round.turn;

    if (state?.step.kind === 'pull' && this.step === 'pull') return state.step.seat;

    return null;
  }

  get round(): RoundSnapshot | null {
    return this.state ? roundSnapshot(this.state, this.step, this.endsAt) : null;
  }

  deal(seats: readonly string[], switches: GameSwitches): void {
    const { state, events } = startGame({ seats: [...seats], switches, random: this.#deps.random });

    this.state = state;
    this.#settle(events);
  }

  // A play or a call.
  move(seat: string, move: Move): void {
    if (!this.state || this.step !== 'turn') throw new TableRoomError('WRONG_PHASE');

    this.#apply(seat, move);
  }

  // Pull the trigger: only whoever has the gun out, once it's out.
  pull(seat: string): void {
    const step = this.state?.step;

    if (step?.kind !== 'pull' || this.step !== 'pull') throw new TableRoomError('WRONG_PHASE');

    if (step.seat !== seat) throw new TableRoomError('NOT_YOUR_TURN');

    this.#press(seat);
  }

  // What happened since the last call, as everyone may see it.
  drain(): PlayEvent[] {
    const played = this.#played;

    this.#played = [];

    return played;
  }

  end(): void {
    this.#deps.clock.stop();
    this.state = null;
    this.step = 'turn';
    this.#played = [];
  }

  #apply(seat: string, move: Move): void {
    if (!this.state) return;

    const result = applyMove(this.state, seat, move, this.#deps.random);

    if (!result.ok) throw new TableRoomError(result.error);

    this.state = result.state;
    this.#settle(result.events);
  }

  // After every change: everyone hears what happened, then the next step and its clock.
  #settle(events: readonly GameEvent[]): void {
    const step = this.state?.step;

    this.#played = [...this.#played, ...publicEvents(events)];
    this.#announceDeaths(events);

    if (step?.kind === 'turn') this.#stage('turn', this.#deps.turnMs(), () => this.#timeout());
    else if (step?.kind === 'pull') this.#gunComing(events);
    else if (step?.kind === 'roundOver') this.#roundOver(events);
    else if (step?.kind === 'over') this.#finish(step.winner);
  }

  #stage(step: RoundStep, ms: number, then: () => void): void {
    this.step = step;
    this.#deps.clock.start(ms, then);
  }

  // Something the clock did: everyone hears about it.
  #later(act: () => void): void {
    act();
    this.#deps.changed();
  }

  #between({ min, max }: { min: number; max: number }): number {
    return min + this.#deps.random() * (max - min);
  }

  #timeout(): void {
    const timeout = this.state ? timeoutMove(this.state, this.#deps.random) : null;

    if (!timeout) return;

    this.#later(() => {
      this.#played = [...this.#played, { type: 'timedOut', seat: timeout.seat, step: 'turn' }];
      this.#deps.timedOut(timeout.seat);
      this.#apply(timeout.seat, timeout.move);
    });
  }

  // Someone has to pull: first the called cards flip, one at a time; then the gun's out.
  #gunComing(events: readonly GameEvent[]): void {
    const flipped = events.find((event) => event.type === 'revealed');

    if (flipped) this.#stage('reveal', revealMs(flipped.cards.length), () => this.#later(() => this.#gunOut()));
    else this.#gunOut();
  }

  // The gun's 10 seconds (D15): then it pulls by itself.
  #gunOut(): void {
    const step = this.state?.step;

    if (step?.kind !== 'pull') return;

    this.#stage('pull', gamePace.pullMs, () =>
      this.#later(() => {
        this.#played = [...this.#played, { type: 'timedOut', seat: step.seat, step: 'pull' }];
        this.#deps.timedOut(step.seat);
        this.#press(step.seat);
      }),
    );
  }

  // The trigger's pressed: a random beat, then the click or the bang (spec §5.6).
  #press(seat: string): void {
    this.#played = [...this.#played, { type: 'pulling', seat }];
    this.#stage('pulling', this.#between(gamePace.beatMs), () => this.#later(() => this.#apply(seat, { type: 'pull' })));
  }

  // The round's end shows for a while, longer after a death; then the next deal.
  #roundOver(events: readonly GameEvent[]): void {
    const bang = events.some((event) => event.type === 'pulled' && event.bang);

    this.#stage('roundOver', bang ? gamePace.afterBangMs : gamePace.afterClickMs, () =>
      this.#later(() => {
        const next = this.state ? nextRound(this.state, this.#deps.random) : null;

        if (!next) return;

        this.state = next.state;
        this.#settle(next.events);
      }),
    );
  }

  #finish(winner: string): void {
    this.#deps.clock.stop();
    this.step = 'roundOver';
    this.#deps.over(winner);
  }

  #announceDeaths(events: readonly GameEvent[]): void {
    const round = this.state?.round.number ?? 0;

    events.forEach((event) => {
      if (event.type === 'pulled' && event.bang) this.#deps.died(event.seat, round);
    });
  }
}
