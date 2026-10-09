import { applySettings, settingChanges, type Move } from '@bluff-table/engine';
import {
  chatMaxLength,
  cleanPersonName,
  defaultGameSettings,
  gameLimits,
  type Character,
  type FeedEvent,
  type GamePhase,
  type GameSettings,
  type GameSettingsPatch,
  type MatchSnapshot,
  type PlayEvent,
  type PlayerColor,
  type SecretSnapshot,
  type TableErrorCode,
  type TableIntents,
  type TableIntentType,
} from '@bluff-table/protocol';
import type { TableLinkListeners } from '../types';
import { DemoBots } from './bots';
import { DemoFeed } from './feed';
import { DemoGame } from './game';
import { DemoHeads } from './heads';
import { demoHandlers, type DemoHandlers, type DemoMoves } from './intents';
import { newBot, nextSample } from './rules';
import type { DemoDeps, DemoMember, DemoTableState } from './types';
import { snapshotFor } from './view';

// Plays the server's part in the browser, with sample players (spec D28): who's at the table, the
// bots, the settings, the chat and the game. The real server (core-api) takes over behind the
// same snapshots, events and intents, with the same rules: bots sit only in free seats, someone
// arriving at a full table takes the newest bot's seat, and only the lobby changes the table.
export class DemoReferee implements DemoTableState {
  members: DemoMember[] = [];
  settings: GameSettings = { ...defaultGameSettings };
  readonly #deps: DemoDeps;
  readonly #out: TableLinkListeners;
  readonly #meId: string;
  readonly #feed: DemoFeed;
  readonly #bots: DemoBots;
  readonly #heads: DemoHeads;
  readonly #game: DemoGame;
  readonly #handlers: DemoHandlers;

  constructor(deps: DemoDeps, out: TableLinkListeners, meId: string) {
    this.#deps = deps;
    this.#out = out;
    this.#meId = meId;
    this.#feed = new DemoFeed(deps);
    this.#bots = new DemoBots(deps, { chat: (id, text) => this.chat(id, text) });
    this.#heads = new DemoHeads(deps, { members: () => this.members, look: out.look, face: out.face });

    this.#game = new DemoGame(deps, {
      members: () => this.members,
      settings: () => this.settings,
      system: (id, event) => this.#system(id, event),
      win: (id) => this.#win(id),
      changed: (events) => this.#emit(events),
    });

    this.#handlers = demoHandlers({ chat: (id, text) => this.chat(id, text), ...this.#moves() });
  }

  get phase(): GamePhase {
    return this.#game.phase;
  }

  get match(): MatchSnapshot | null {
    return this.#game.snapshot();
  }

  get #isFull(): boolean {
    return this.members.length >= gameLimits.maxPlayers;
  }

  get #isLobby(): boolean {
    return this.#game.phase === 'lobby';
  }

  secretFor(memberId: string): SecretSnapshot {
    return this.#game.secret(memberId);
  }

  handle<T extends TableIntentType>(memberId: string, type: T, message: TableIntents[T]): void {
    (this.#handlers[type] as (memberId: string, message: TableIntents[T]) => void)(memberId, message);
  }

  join(member: DemoMember): void {
    this.#makeRoom();
    this.members.push(member);
    this.#feed.system(member, { type: 'joined' });

    if (member.sample) this.#bots.greet(member);

    if (member.sample || member.bot) this.#heads.start(member);

    this.#emit();
  }

  leave(memberId: string): void {
    const member = this.#member(memberId);

    if (!member) return;

    this.members = this.members.filter((other) => other !== member);
    this.#heads.stop(member.id);
    this.#game.leave(member.id);
    this.#feed.system(member, { type: 'left' });
    this.#emit();
  }

  chat(memberId: string, text: string): void {
    const author = this.#member(memberId);
    const clean = text.trim().slice(0, chatMaxLength);

    if (!author || !clean) return;

    this.#feed.message(author, clean);
    this.#emit();
  }

  // Demo buttons: a sample player sits down or gets up. Mid-game they watch until the next one.
  addSample(): void {
    const sample = nextSample(this.members, this.#deps.createId, this.#deps.random);

    if (sample && (!this.#isFull || (this.#isLobby && this.members.some((member) => member.bot)))) this.join(sample);
  }

  removeSample(): void {
    const sample = this.members.findLast((member) => member.sample);

    if (sample) this.leave(sample.id);
  }

  dispose(): void {
    this.#bots.cancel();
    this.#heads.dispose();
    this.#game.dispose();
  }

  // The moves the intents call, besides chat.
  #moves(): Omit<DemoMoves, 'chat'> {
    return {
      updateSettings: (id, patch) => this.#lobbyOnly('updateSettings', () => this.#updateSettings(id, patch)),
      rename: (id, name) => this.#rename(id, name),
      addBot: (id) => this.#lobbyOnly('addBot', () => this.#addBot(id)),
      removeBot: (id, botId) => this.#lobbyOnly('removeBot', () => this.#removeBot(id, botId)),
      dress: (id, character, color) => this.#lobbyOnly('dress', () => this.#dress(id, character, color)),
      look: (id, x, y) => this.#heads.mine(id, x, y),
      face: () => undefined,
      start: (id) => this.#answer('start', this.#game.start(id)),
      move: (id, move: Move) => this.#answer(move.type, this.#game.move(id, move)),
      pull: (id) => this.#answer('pull', this.#game.pull(id)),
      playAgain: (id) => this.#answer('playAgain', this.#game.playAgain(id)),
      toLobby: () => this.#answer('toLobby', this.#game.toLobby()),
    };
  }

  // A game move's answer: refused, or everyone sees what changed (the game has already said so).
  #answer(type: TableIntentType, code: TableErrorCode | null): void {
    if (code) this.#out.refused({ type, code });
    else if (type === 'toLobby') this.#emit();
  }

  #lobbyOnly(type: TableIntentType, action: () => void): void {
    if (this.#isLobby) action();
    else this.#out.refused({ type, code: 'WRONG_PHASE' });
  }

  #updateSettings(memberId: string, patch: GameSettingsPatch): void {
    const author = this.#member(memberId);

    if (!author) return;

    const next = applySettings(this.settings, patch);

    settingChanges(this.settings, next).forEach((change) => this.#feed.system(author, change));
    this.settings = next;
    this.#emit();
  }

  #rename(memberId: string, name: string): void {
    const member = this.#member(memberId);
    const clean = cleanPersonName(name);

    if (!member || !clean || clean === member.name) return;

    member.name = clean;
    this.#feed.system(member, { type: 'renamed', name: clean });
    this.#emit();
  }

  #addBot(memberId: string): void {
    const author = this.#member(memberId);

    if (!author) return;

    if (this.#isFull) {
      this.#out.refused({ type: 'addBot', code: 'TABLE_FULL' });

      return;
    }

    const bot = newBot(this.members, this.#deps.createId, this.#deps.random);

    this.members.push(bot);
    this.#heads.start(bot);
    this.#feed.system(author, { type: 'botAdded', name: bot.name });
    this.#emit();
  }

  #removeBot(memberId: string, botId: string): void {
    const author = this.#member(memberId);
    const bot = this.#member(botId);

    if (!author || !bot?.bot) return;

    this.members = this.members.filter((other) => other !== bot);
    this.#heads.stop(bot.id);
    this.#feed.system(author, { type: 'botRemoved', name: bot.name });
    this.#emit();
  }

  // A new look and colour; a colour someone else wears is refused, as at a live table.
  #dress(memberId: string, character: Character, color: PlayerColor): void {
    const member = this.#member(memberId);

    if (!member) return;

    if (this.members.some((other) => other !== member && other.color === color)) {
      this.#out.refused({ type: 'dress', code: 'COLOR_TAKEN' });
      this.#emit();

      return;
    }

    member.character = character;
    member.color = color;
    this.#emit();
  }

  #system(memberId: string, event: FeedEvent): void {
    const member = this.#member(memberId);

    if (member) this.#feed.system(member, event);
  }

  #win(memberId: string): number {
    const member = this.#member(memberId);

    if (member) member.wins += 1;

    return (member?.wins ?? 0) * gameLimits.bountyPerWin;
  }

  // Someone is sitting down at a full table in the lobby: the newest bot gets up for them.
  #makeRoom(): void {
    const bot = this.members.findLast((member) => member.bot);

    if (this.#isFull && bot && this.#isLobby) this.leave(bot.id);
  }

  #member(id: string): DemoMember | undefined {
    return this.members.find((member) => member.id === id);
  }

  #emit(events: readonly PlayEvent[] = []): void {
    this.#out.snapshot(snapshotFor(this, this.#feed, this.#meId));

    if (events.length > 0) this.#out.play([...events]);
  }
}
