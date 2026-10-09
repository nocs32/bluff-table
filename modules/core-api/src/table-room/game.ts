import { applySettings, settingChanges } from '@bluff-table/engine';
import { defaultGameSettings, type GamePhase, type GameSettings, type GameSettingsPatch } from '@bluff-table/protocol';
import { TableRoomError } from './error.js';
import type { TableRoomFeed } from './feed.js';
import type { TableRoomMembers } from './members.js';

export interface TableRoomGameDeps {
  members: TableRoomMembers;
  feed: TableRoomFeed;
}

// The game's state and its settings. Only the lobby for now: the rounds, the calls and the pulls
// come with the rules (spec §10.3).
export class TableRoomGame {
  phase: GamePhase = 'lobby';
  settings: GameSettings = { ...defaultGameSettings };
  readonly #deps: TableRoomGameDeps;

  constructor(deps: TableRoomGameDeps) {
    this.#deps = deps;
  }

  // Anyone may change the settings in the lobby (spec D25); each change gets a feed line.
  updateSettings(memberId: string, patch: GameSettingsPatch): void {
    const author = this.#deps.members.get(memberId);

    this.#expect('lobby');

    const next = applySettings(this.settings, patch);

    settingChanges(this.settings, next).forEach((change) => this.#deps.feed.system(author, change));
    this.settings = next;
  }

  #expect(phase: GamePhase): void {
    if (this.phase !== phase) throw new TableRoomError('WRONG_PHASE');
  }
}
