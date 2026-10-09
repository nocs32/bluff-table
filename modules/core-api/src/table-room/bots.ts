import { botMove, botPersonalities, seatView, type BotPersonality } from '@bluff-table/engine';
import { gameLimits, gamePace } from '@bluff-table/protocol';
import { limits } from '../limits.js';
import { TableRoomError } from './error.js';
import type { TableRoomFeed } from './feed.js';
import type { TableRoomGame } from './game/index.js';
import type { Schedule } from './lifecycle.js';
import type { TableRoomMember, TableRoomMembers } from './members.js';

export interface TableRoomBotsDeps {
  members: TableRoomMembers;
  feed: TableRoomFeed;
  game: Pick<TableRoomGame, 'phase' | 'match' | 'seats' | 'botMove'>;
  schedule: Schedule;
  random: () => number;
  createId: () => string;
  // A bot moved on its own: everyone needs to hear about it.
  changed: () => void;
}

const { standInWaitMs } = limits.table;

// The bots (spec D9, §6, §6.1 layer 3). In the lobby, anyone may sit one down in a free seat or send
// one away, and a person who arrives at a full table takes the newest bot's seat. In a game, a bot
// plays its own seat, and the seat of anyone who left or ran out of time twice in a row, with the
// thinking bot (a personality each, per game): a human-ish think before a play or a call, a nervous
// wait before it pulls. For someone still at the table it waits a few seconds more, so they can take
// their seat back.
export class TableRoomBots {
  #thinking: { key: string; cancel: () => void } | null = null;
  readonly #brains = new Map<string, BotPersonality>();
  readonly #deps: TableRoomBotsDeps;

  constructor(deps: TableRoomBotsDeps) {
    this.#deps = deps;
  }

  add(authorId: string): TableRoomMember {
    const { members, feed } = this.#deps;
    const author = members.get(authorId);

    this.#checkLobby();

    if (members.count >= gameLimits.maxPlayers) throw new TableRoomError('TABLE_FULL');

    const bot = members.seatBot(`bot-${this.#deps.createId()}`);

    feed.system(author, { type: 'botAdded', name: bot.name });

    return bot;
  }

  remove(authorId: string, botId: string): void {
    const { members, feed } = this.#deps;
    const author = members.get(authorId);

    this.#checkLobby();

    if (!members.get(botId).bot) throw new TableRoomError('NOT_A_BOT');

    feed.system(author, { type: 'botRemoved', name: members.leave(botId).name });
  }

  // Someone is sitting down at a full table in the lobby: the newest bot gets up for them.
  makeRoom(): void {
    const { members, feed } = this.#deps;
    const bot = members.newestBot;

    if (!bot || members.count < gameLimits.maxPlayers || this.#deps.game.phase !== 'lobby') return;

    members.leave(bot.id);
    feed.system(bot, { type: 'left' });
  }

  // After every change: whoever has the decision now, if a bot plays for them, starts thinking.
  drive(): void {
    const { game } = this.#deps;
    const seat = game.phase === 'round' ? game.match.actor : null;

    if (game.phase !== 'round') this.#brains.clear();

    const key = seat === null ? null : this.#decision(seat);

    if (this.#thinking?.key === key) return;

    this.#stopThinking();

    if (seat === null || key === null || !this.#isBot(seat)) return;

    const pace = game.match.step === 'pull' ? gamePace.botPullMs : gamePace.botThinkMs;
    const delay = this.#waitFor(seat) + pace.min + this.#deps.random() * (pace.max - pace.min);

    this.#thinking = { key, cancel: this.#deps.schedule(() => this.#act(seat), delay) };
  }

  dispose(): void {
    this.#stopThinking();
    this.#brains.clear();
  }

  // One think per decision: another turn or another gun replaces it.
  #decision(seat: string): string {
    const { match } = this.#deps.game;
    const round = match.state?.round;

    return [seat, match.step, round?.number, round?.plays.length, match.state?.revolvers[seat]?.used].join('|');
  }

  #isBot(seat: string): boolean {
    return this.#deps.members.find(seat)?.bot === true || this.#deps.game.seats.standIns.has(seat);
  }

  // Someone a bot stands in for who's still here gets a few seconds to move themselves.
  #waitFor(seat: string): number {
    const member = this.#deps.members.find(seat);

    return member?.bot === false && member.connected ? standInWaitMs : 0;
  }

  #brain(seat: string): BotPersonality {
    const known = this.#brains.get(seat);

    if (known) return known;

    const brain = botPersonalities[Math.floor(this.#deps.random() * botPersonalities.length)] ?? 'honest';

    this.#brains.set(seat, brain);

    return brain;
  }

  #act(seat: string): void {
    const { game, random } = this.#deps;
    const state = game.match.state;

    this.#thinking = null;

    if (!state) return;

    try {
      game.botMove(seat, game.match.step === 'pull' ? { type: 'pull' } : botMove(seatView(state, seat), this.#brain(seat), random));
    } catch (error) {
      // A move that came too late (the turn moved on) is fine.
      if (!(error instanceof TableRoomError)) throw error;
    }

    this.#deps.changed();
  }

  #stopThinking(): void {
    this.#thinking?.cancel();
    this.#thinking = null;
  }

  #checkLobby(): void {
    if (this.#deps.game.phase !== 'lobby') throw new TableRoomError('WRONG_PHASE');
  }
}
