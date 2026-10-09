import type { GamePhase, GameSnapshot } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';
import { RoomGameSettingsStore } from './settings';

export interface RoomGameDeps {
  t: Translate;
  send: TableSend;
  notify: (text: string) => void;
  // Two seats are filled, people or bots (spec §4.2).
  isReady: () => boolean;
}

// The game as you see it: its phase (the state) and the settings. The table runs the game; this
// only shows it and asks. Only the lobby for now: rounds, calls and pulls come in M1 (spec §12).
export class RoomGameStore {
  state: GamePhase = 'lobby';
  readonly settings: RoomGameSettingsStore;
  readonly #deps: RoomGameDeps;

  constructor(deps: RoomGameDeps) {
    this.#deps = deps;
    this.settings = new RoomGameSettingsStore({ t: deps.t, send: deps.send, isEditable: () => this.state === 'lobby' });
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isLobby(): boolean {
    return this.state === 'lobby';
  }

  get canDeal(): boolean {
    return this.isLobby && this.#deps.isReady();
  }

  get dealHint(): string {
    return this.canDeal ? this.#deps.t('lobby.dealHint') : this.#deps.t('lobby.dealWaiting');
  }

  // Deal the cards (spec §4.2). The rounds are the next part of M1: until then it says so.
  deal(): void {
    if (this.canDeal) this.#deps.notify(this.#deps.t('lobby.dealSoon'));
  }

  // "New to this? The rules in 2 minutes" (spec §9.1): the rule book comes with the rounds.
  openRules(): void {
    this.#deps.notify(this.#deps.t('lobby.rulesSoon'));
  }

  receive(game: GameSnapshot): void {
    this.state = game.phase;
    this.settings.receive(game.settings);
  }
}
