import type { GamePhase, GameSnapshot } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';
import { RoomGameSettingsStore } from './settings';

export interface RoomGameDeps {
  t: Translate;
  send: TableSend;
}

// The game as you see it: its phase (the state) and the settings. The table runs the game; this
// only shows it and asks. Only the lobby for now: rounds, calls and pulls come in M1 (spec §12).
export class RoomGameStore {
  state: GamePhase = 'lobby';
  readonly settings: RoomGameSettingsStore;

  constructor(deps: RoomGameDeps) {
    this.settings = new RoomGameSettingsStore({ t: deps.t, send: deps.send, isEditable: () => this.state === 'lobby' });
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isLobby(): boolean {
    return this.state === 'lobby';
  }

  receive(game: GameSnapshot): void {
    this.state = game.phase;
    this.settings.receive(game.settings);
  }
}
