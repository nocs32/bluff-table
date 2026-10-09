import { gameLimits } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';
import type { RoomGameMatchStore } from './match';

export interface RoomGameSummaryDeps {
  t: Translate;
  send: TableSend;
  match: RoomGameMatchStore;
  // Games each member has won tonight.
  winsOf: (id: string) => number;
}

// The end of a game (spec §4.4): who won and their new bounty, who died when, the boldest lie that
// got away and the best call, then Play again or back to the lobby.
export class RoomGameSummaryStore {
  readonly #deps: RoomGameSummaryDeps;

  constructor(deps: RoomGameSummaryDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get winner(): string | null {
    return this.#deps.match.match?.summary?.winner ?? null;
  }

  get title(): string {
    const { t, match } = this.#deps;
    const winner = this.winner ?? '';

    return winner === match.meId ? t('round.over.youWin') : t('round.over.wins', { name: match.nameOf(winner) });
  }

  get bounty(): string {
    const winner = this.winner ?? '';

    return this.#deps.t('round.over.bounty', { name: this.#deps.match.nameOf(winner), amount: this.#deps.winsOf(winner) * gameLimits.bountyPerWin });
  }

  // One line each: the deaths in order, the boldest lie, the best call.
  get lines(): string[] {
    const { t, match } = this.#deps;
    const summary = match.match?.summary;

    if (!summary) return [];

    const deaths = summary.deaths.map(({ seat, round }) => t('round.over.died', { name: match.nameOf(seat), round }));
    const boldest = summary.boldest ? [t('round.over.boldest', { name: match.nameOf(summary.boldest.seat), count: summary.boldest.count })] : [];
    const bestCall = summary.bestCall ? [t('round.over.bestCall', { name: match.nameOf(summary.bestCall.seat), count: summary.bestCall.count })] : [];

    return [...deaths, ...boldest, ...bestCall];
  }

  playAgain(): void {
    this.#deps.send('playAgain', {});
  }

  toLobby(): void {
    this.#deps.send('toLobby', {});
  }
}
