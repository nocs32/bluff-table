import { applySettings, settingChanges } from '@bluff-table/engine';
import {
  chatMaxLength,
  cleanPersonName,
  defaultGameSettings,
  gameLimits,
  type GamePhase,
  type GameSettings,
  type Character,
  type GameSettingsPatch,
  type PlayerColor,
  type TableIntents,
  type TableIntentType,
} from '@bluff-table/protocol';
import type { TableLinkListeners } from '../types';
import { DemoBots } from './bots';
import { DemoFeed } from './feed';
import { DemoHeads } from './heads';
import { demoHandlers, type DemoHandlers } from './intents';
import { newBot, nextSample } from './rules';
import type { DemoDeps, DemoMember, DemoTableState } from './types';
import { snapshotFor } from './view';

// Plays the server's part in the browser, with sample players (spec D28): who's at the table, the
// bots, the settings and the chat. The real server (core-api) takes over behind the same
// snapshots, events and intents, with the same rules: bots sit only in free seats, and someone
// arriving at a full table takes the newest bot's seat. The game itself comes in M1.
export class DemoReferee implements DemoTableState {
  members: DemoMember[] = [];
  settings: GameSettings = { ...defaultGameSettings };
  readonly phase: GamePhase = 'lobby';
  readonly #deps: DemoDeps;
  readonly #out: TableLinkListeners;
  readonly #feed: DemoFeed;
  readonly #bots: DemoBots;
  readonly #heads: DemoHeads;
  readonly #handlers: DemoHandlers;

  constructor(deps: DemoDeps, out: TableLinkListeners) {
    this.#deps = deps;
    this.#out = out;
    this.#feed = new DemoFeed(deps);
    this.#bots = new DemoBots(deps, { chat: (id, text) => this.chat(id, text) });
    this.#heads = new DemoHeads(deps, { members: () => this.members, look: out.look, face: out.face });
    this.#handlers = demoHandlers(this);
  }

  get #isFull(): boolean {
    return this.members.length >= gameLimits.maxPlayers;
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
    this.#feed.system(member, { type: 'left' });
    this.#emit();
  }

  updateSettings(memberId: string, patch: GameSettingsPatch): void {
    const author = this.#member(memberId);

    if (!author) return;

    const next = applySettings(this.settings, patch);

    settingChanges(this.settings, next).forEach((change) => this.#feed.system(author, change));
    this.settings = next;
    this.#emit();
  }

  chat(memberId: string, text: string): void {
    const author = this.#member(memberId);
    const clean = text.trim().slice(0, chatMaxLength);

    if (!author || !clean) return;

    this.#feed.message(author, clean);
    this.#emit();
  }

  rename(memberId: string, name: string): void {
    const member = this.#member(memberId);
    const clean = cleanPersonName(name);

    if (!member || !clean || clean === member.name) return;

    member.name = clean;
    this.#feed.system(member, { type: 'renamed', name: clean });
    this.#emit();
  }

  addBot(memberId: string): void {
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

  removeBot(memberId: string, botId: string): void {
    const author = this.#member(memberId);
    const bot = this.#member(botId);

    if (!author || !bot?.bot) return;

    this.members = this.members.filter((other) => other !== bot);
    this.#heads.stop(bot.id);
    this.#feed.system(author, { type: 'botRemoved', name: bot.name });
    this.#emit();
  }

  // A new look and colour; a colour someone else wears is refused, as at a live table.
  dress(memberId: string, character: Character, color: PlayerColor): void {
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

  look(memberId: string, x: number, y: number): void {
    this.#heads.mine(memberId, x, y);
  }

  // Demo buttons: a sample player sits down or gets up.
  addSample(): void {
    const sample = nextSample(this.members, this.#deps.createId, this.#deps.random);

    if (sample && (!this.#isFull || this.members.some((member) => member.bot))) this.join(sample);
  }

  removeSample(): void {
    const sample = this.members.findLast((member) => member.sample);

    if (sample) this.leave(sample.id);
  }

  dispose(): void {
    this.#bots.cancel();
    this.#heads.dispose();
  }

  // Someone is sitting down at a full table in the lobby: the newest bot gets up for them.
  #makeRoom(): void {
    const bot = this.members.findLast((member) => member.bot);

    if (this.#isFull && bot) this.leave(bot.id);
  }

  #member(id: string): DemoMember | undefined {
    return this.members.find((member) => member.id === id);
  }

  #emit(): void {
    this.#out.snapshot(snapshotFor(this, this.#feed));
  }
}
