import { gameLimits } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../../services';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';
import type { RoomGameClockStore } from './clock';
import type { RoomGameMatchStore } from './match';

export interface RoomGameTurnDeps {
  t: Translate;
  send: TableSend;
  match: RoomGameMatchStore;
  clock: RoomGameClockStore;
  schedule: Schedule;
  // The double call is switched on for this game (spec §5.9).
  doubleCall: () => boolean;
}

// The prompt at the top left (spec §9.2): what's going on, in a bold line and a plain one.
export interface TurnPrompt {
  title: string;
  line: string;
}

// The double call fires after you've held it this long (spec §5.9).
export const holdMs = 1000;

// The fuse burns along your turn's last seconds (D14).
const burnSeconds = 8;

// Your turn's choices (spec §5.4): the prompt, Liar! with its stakes, and Liar! ×2, held for a
// second while the screen reddens (idle ⇄ holding → fired).
export class RoomGameTurnStore {
  holding = false;
  #stopHold: (() => void) | null = null;
  readonly #deps: RoomGameTurnDeps;

  constructor(deps: RoomGameTurnDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get secondsLeft(): number {
    return this.#deps.clock.secondsUntil(this.#deps.match.round?.endsAt ?? null);
  }

  // The last seconds of your own turn.
  get isBurning(): boolean {
    return this.#deps.match.isMyTurn && this.secondsLeft <= burnSeconds;
  }

  get canCall(): boolean {
    const { match } = this.#deps;

    return match.isMyTurn && !match.round?.opening;
  }

  get isForced(): boolean {
    return this.#deps.match.isMyTurn && (this.#deps.match.round?.forced ?? false);
  }

  get canDouble(): boolean {
    return this.canCall && this.#deps.doubleCall() && !(this.#deps.match.me?.doubleUsed ?? true);
  }

  // Liar! ×2 shows when it's switched on and you haven't had yours this game.
  get showsDouble(): boolean {
    return this.#deps.doubleCall() && this.#deps.match.isAlive && !(this.#deps.match.me?.doubleUsed ?? true);
  }

  // What a call risks (spec D22): "If Ann told the truth, you pull: 2 of 6 used."
  get callStakes(): string {
    const { t, match } = this.#deps;
    const last = match.lastPlay;

    if (!last) return '';

    const values = { name: match.nameOf(last.seat), used: match.me?.used ?? 0, total: gameLimits.chambers };
    const whispered = match.round?.whispered === last.seat;

    return t(whispered ? 'round.turn.stakesWhispered' : 'round.turn.stakes', values);
  }

  get doubleStakes(): string {
    return this.#deps.t('round.turn.doubleStakes');
  }

  get prompt(): TurnPrompt | null {
    const { match } = this.#deps;
    const round = match.round;

    if (!round) return null;

    if (round.step === 'turn') return match.isMyTurn ? this.#myTurn() : this.#theirTurn();

    return null;
  }

  call(): void {
    if (this.canCall) this.#deps.send('call', { double: false });
  }

  // Pressing Liar! ×2: it fires only if you hold on for a second.
  hold(): void {
    if (!this.canDouble || this.holding) return;

    this.holding = true;
    this.#stopHold = this.#deps.schedule(() => this.#fire(), holdMs);
  }

  // Space or Enter held down on Liar! ×2 works like holding the pointer on it.
  holdKey(key: string): void {
    if (key === ' ' || key === 'Enter') this.hold();
  }

  letGo(): void {
    this.#stopHold?.();
    this.#stopHold = null;
    this.holding = false;
  }

  #fire(): void {
    this.#stopHold = null;
    this.holding = false;

    if (this.canDouble) this.#deps.send('call', { double: true });
  }

  #myTurn(): TurnPrompt {
    const { t, match } = this.#deps;
    const last = match.lastPlay;
    const rank = match.rankLabel();

    if (!last) return { title: t('round.turn.openTitle', { rank }), line: t('round.turn.openLine', { rank }) };

    const values = { name: match.nameOf(last.seat), count: last.count, rank: match.rankLabel(last.count > 1) };

    if (this.isForced) return { title: t('round.turn.forcedTitle'), line: t('round.turn.forcedLine', values) };

    return { title: t('round.turn.playedTitle', values), line: t('round.turn.playedLine', values) };
  }

  #theirTurn(): TurnPrompt {
    const { t, match } = this.#deps;
    const round = match.round;
    const last = match.lastPlay;
    const name = match.nameOf(round?.turn ?? '');

    if (!last) return { title: t('round.turn.theirsTitle', { name }), line: t('round.turn.theirsOpen', { name, rank: match.rankLabel() }) };

    const values = { name, last: match.nameOf(last.seat), count: last.count, rank: match.rankLabel(last.count > 1) };

    return { title: t('round.turn.theirsTitle', { name }), line: t(round?.forced ? 'round.turn.theirsForced' : 'round.turn.theirsPlayed', values) };
  }
}
