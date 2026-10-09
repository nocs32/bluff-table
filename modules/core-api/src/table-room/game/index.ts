import { applySettings, gameSummary, seatStates, secretsFor, settingChanges, type Move } from '@bluff-table/engine';
import { defaultGameSettings, gameLimits, noSecrets, type GamePhase, type GameSettings, type GameSettingsPatch, type MatchSnapshot, type PlayEvent, type SecretSnapshot } from '@bluff-table/protocol';
import { TableRoomError } from '../error.js';
import type { TableRoomFeed } from '../feed.js';
import type { Schedule } from '../lifecycle.js';
import type { TableRoomMember, TableRoomMembers } from '../members.js';
import { TableRoomGameClock } from './clock.js';
import { TableRoomGameMatch } from './match.js';
import { TableRoomGameSeats, type TableRoomGameHolder } from './seats.js';

export interface TableRoomGameDeps {
  members: TableRoomMembers;
  feed: TableRoomFeed;
  schedule: Schedule;
  now: () => number;
  random: () => number;
  // The clock moved the game on, with nobody asking: everyone needs to hear about it.
  changed: () => void;
}

const holderOf = ({ id, name, color, character }: TableRoomMember): TableRoomGameHolder => ({ id, name, color, character });

// The game's states (spec §10.3): lobby → round → over → (Play again) round … or back to the lobby;
// the settings; who sits in the game; and the match itself with its pace. A night is game after
// game, and each win raises the winner's bounty (D16).
export class TableRoomGame {
  phase: GamePhase = 'lobby';
  settings: GameSettings = { ...defaultGameSettings };
  readonly seats = new TableRoomGameSeats();
  readonly #clock: TableRoomGameClock;
  readonly match: TableRoomGameMatch;
  readonly #deps: TableRoomGameDeps;

  constructor(deps: TableRoomGameDeps) {
    this.#deps = deps;
    this.#clock = new TableRoomGameClock({ schedule: deps.schedule, now: deps.now });

    this.match = new TableRoomGameMatch({
      clock: this.#clock,
      random: deps.random,
      turnMs: () => this.settings.turnSeconds * 1000,
      timedOut: (seat) => this.seats.timedOut(seat),
      died: (seat, round) => this.#line(seat, { type: 'died', round }),
      over: (winner) => this.#over(winner),
      changed: deps.changed,
    });
  }

  // Anyone may change the settings in the lobby (spec D25); each change gets a feed line.
  updateSettings(memberId: string, patch: GameSettingsPatch): void {
    const author = this.#deps.members.get(memberId);

    this.#expect('lobby');

    const next = applySettings(this.settings, patch);

    settingChanges(this.settings, next).forEach((change) => this.#deps.feed.system(author, change));
    this.settings = next;
  }

  // Anyone deals, once two seats are filled (spec §4.2), from the lobby or after a game.
  start(memberId: string): void {
    const author = this.#deps.members.get(memberId);

    if (this.phase === 'round') throw new TableRoomError('WRONG_PHASE');

    const holders = this.#holders();

    if (holders.length < gameLimits.minPlayers) throw new TableRoomError('NOT_ENOUGH_PLAYERS');

    this.#deps.feed.system(author, { type: 'gameStarted' });
    this.seats.seat(holders);
    this.phase = 'round';
    this.match.deal(this.seats.ids, this.settings.switches);
  }

  // After a game: the next one with everyone at the table (spec §4.4).
  playAgain(memberId: string): void {
    this.#expect('over');
    this.start(memberId);
  }

  toLobby(memberId: string): void {
    this.#deps.members.get(memberId);
    this.#expect('over');
    this.#end();
  }

  // A person's own play or call: if a bot was playing for them, they're back.
  move(memberId: string, move: Move): void {
    this.#checkSeated(memberId);
    this.match.move(memberId, move);
    this.seats.acted(memberId);
  }

  pull(memberId: string): void {
    this.#checkSeated(memberId);
    this.match.pull(memberId);
    this.seats.acted(memberId);
  }

  // A bot's move, for a bot's seat or one it's standing in for.
  botMove(seat: string, move: Move): void {
    this.#checkSeated(seat);

    if (move.type === 'pull') this.match.pull(seat);
    else this.match.move(seat, move);
  }

  // Someone left for good mid-game: a bot plays their seat from now on (spec §4.5).
  leave(memberId: string): void {
    if (this.phase === 'round') this.seats.dropOut(memberId);
  }

  // The game being played, or the one that just ended, as everyone sees it.
  snapshot(): MatchSnapshot | null {
    const state = this.match.state;

    if (this.phase === 'lobby' || !state) return null;

    const seats = seatStates(state).map((seat) => ({ ...seat, ...this.#holder(seat.id), standIn: this.seats.standIns.has(seat.id) }));

    return { deckSize: state.deck.length, seats, round: this.match.round, summary: gameSummary(state) };
  }

  // What only this person may see (D24).
  secret(memberId: string): SecretSnapshot {
    const state = this.match.state;

    return state && this.phase !== 'lobby' ? secretsFor(state, memberId) : noSecrets;
  }

  drainPlayed(): PlayEvent[] {
    return this.match.drain();
  }

  dispose(): void {
    this.#clock.dispose();
  }

  // How a seat's holder looks now: their latest name and look while they're here (spec §4.5).
  #holder(id: string): TableRoomGameHolder {
    const member = this.#deps.members.find(id);

    return member ? holderOf(member) : this.seats.holder(id);
  }

  #expect(phase: GamePhase): void {
    if (this.phase !== phase) throw new TableRoomError('WRONG_PHASE');
  }

  #checkSeated(memberId: string): void {
    if (this.phase !== 'round') throw new TableRoomError('WRONG_PHASE');

    if (!this.seats.has(memberId)) throw new TableRoomError('NOT_PLAYING');
  }

  // Everyone at the table gets a seat, people (reconnecting ones too) and bots, at most six: the
  // newest bots make way for people who joined mid-game (spec §4.5).
  #holders(): TableRoomGameHolder[] {
    const all = this.#deps.members.all.map(holderOf);
    const bots = new Set(this.#deps.members.all.filter((member) => member.bot).map((member) => member.id));

    while (all.length > gameLimits.maxPlayers) {
      const bot = all.findLastIndex((holder) => bots.has(holder.id));

      all.splice(bot >= 0 ? bot : all.length - 1, 1);
    }

    return all;
  }

  #over(winner: string): void {
    this.phase = 'over';
    this.#line(winner, { type: 'gameWon', bounty: this.#deps.members.win(winner) * gameLimits.bountyPerWin });
  }

  #end(): void {
    this.phase = 'lobby';
    this.match.end();
    this.seats.clear();
  }

  // A feed line about a seat's holder, even if they've left.
  #line(seat: string, event: Parameters<TableRoomFeed['system']>[1]): void {
    this.#deps.feed.system(this.#deps.members.find(seat) ?? this.seats.holder(seat), event);
  }
}
