import { gamePace } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { CardArtService } from '../../../services';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';
import type { RoomGameClockStore } from './clock';
import type { RoomGameMatchStore } from './match';
import type { TurnPrompt } from './turn';

export interface RoomGamePullDeps {
  t: Translate;
  send: TableSend;
  match: RoomGameMatchStore;
  clock: RoomGameClockStore;
  cardArt: CardArtService;
}

// The gun (spec §5.6, §8.4): who has it and why, the odds of this pull, and your Pull the trigger
// button with its 10-second ring. Waiting → pressed (until the click or the bang comes back).
export class RoomGamePullStore {
  pressed = false;
  readonly #deps: RoomGamePullDeps;

  constructor(deps: RoomGamePullDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get step(): string | null {
    return this.#deps.match.round?.step ?? null;
  }

  // Your gun is out and it's waiting for you.
  get isMine(): boolean {
    const { match } = this.#deps;

    return match.isMyGun && (this.step === 'pull' || this.step === 'pulling');
  }

  get canPress(): boolean {
    return this.isMine && this.step === 'pull' && !this.pressed;
  }

  get secondsLeft(): number {
    return this.#deps.clock.secondsUntil(this.step === 'pull' ? (this.#deps.match.round?.endsAt ?? null) : null);
  }

  // How much of the gun's time is gone, 0 to 1, for the ring.
  get spent(): number {
    const endsAt = this.#deps.match.round?.endsAt ?? 0;

    return this.step === 'pull' ? Math.min(1, Math.max(0, 1 - (endsAt - this.#deps.clock.now) / gamePace.pullMs)) : 1;
  }

  // "This pull: 1 in 4", or that it's certain.
  get odds(): string {
    const { t, match } = this.#deps;
    const left = match.chambersLeft(match.puller ?? '');

    return left > 1 ? t('round.pull.odds', { left }) : t('round.pull.certain');
  }

  // The cylinder of the gun that's out, as everyone sees it.
  get cylinder(): string {
    const { match, cardArt } = this.#deps;

    return cardArt.cylinder(match.chambersLeft(match.puller ?? ''));
  }

  get pullsLabel(): string {
    const pulls = this.#deps.match.round?.puller?.pulls ?? 1;

    return pulls > 1 ? this.#deps.t('round.pull.twice') : '';
  }

  // Why it's you, in your own words.
  get reason(): string {
    const { t, match } = this.#deps;
    const puller = match.round?.puller;

    return puller ? t(`round.pull.reasonYou.${puller.reason}`, { odds: this.odds }) : '';
  }

  // The prompt while the cards flip, the gun's out, and the round ends.
  get prompt(): TurnPrompt | null {
    const { t, match } = this.#deps;
    const round = match.round;
    const puller = round?.puller;

    if (!round) return null;

    if (round.step === 'roundOver') return this.#roundOver();

    if (!puller) return null;

    const values = { name: match.nameOf(puller.seat), odds: this.odds };
    const you = puller.seat === match.meId;

    if (round.step === 'reveal') return { title: t('round.pull.revealTitle'), line: t('round.pull.revealLine') };

    return { title: t(you ? 'round.pull.youTitle' : 'round.pull.theyTitle', values), line: you ? this.reason : t(`round.pull.reason.${puller.reason}`, values) };
  }

  press(): void {
    if (!this.canPress) return;

    this.pressed = true;
    this.#deps.send('pull', {});
  }

  // A new step: the press is answered (or a new pull begins).
  tidy(): void {
    if (this.step !== 'pulling') this.pressed = false;
  }

  #roundOver(): TurnPrompt {
    const { t, match } = this.#deps;
    const house = match.round?.house;

    if (!house) return { title: t('round.pull.overTitle'), line: t('round.pull.overLine') };

    return { title: t(house.crooked ? 'round.pull.crookedTitle' : 'round.pull.straightTitle'), line: t(house.crooked ? 'round.pull.crookedLine' : 'round.pull.straightLine', { name: match.nameOf(house.seat) }) };
  }
}
