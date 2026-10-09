import { gameLimits, noSecrets, type Card, type MatchSnapshot, type PlaySize, type RoundSnapshot, type SeatSnapshot, type SecretSnapshot, type TableRank } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';

export interface RoomGameMatchDeps {
  t: Translate;
}

// The game as the table last sent it (spec §10.4): the seats, the round, the summary, and what only
// you may see. Everything else in the game reads it from here.
export class RoomGameMatchStore {
  match: MatchSnapshot | null = null;
  secret: SecretSnapshot = noSecrets;
  meId = '';
  readonly #deps: RoomGameMatchDeps;

  constructor(deps: RoomGameMatchDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get round(): RoundSnapshot | null {
    return this.match?.round ?? null;
  }

  get seats(): SeatSnapshot[] {
    return this.match?.seats ?? [];
  }

  get seatIds(): string[] {
    return this.seats.map((seat) => seat.id);
  }

  get me(): SeatSnapshot | null {
    return this.seat(this.meId);
  }

  // You're playing this game (alive or a ghost), not watching it.
  get isSeated(): boolean {
    return this.me !== null;
  }

  get isAlive(): boolean {
    return this.me?.alive ?? false;
  }

  get isGhost(): boolean {
    return this.me !== null && !this.me.alive;
  }

  get isSpectator(): boolean {
    return this.match !== null && this.me === null;
  }

  get tableRank(): TableRank | null {
    return this.round?.tableRank ?? null;
  }

  get hand(): Card[] {
    return this.secret.hand ?? [];
  }

  get isMyTurn(): boolean {
    return this.round?.step === 'turn' && this.round.turn === this.meId && this.isAlive;
  }

  // The play on top of the pile: the one a call is about.
  get lastPlay(): PlaySize | null {
    return this.round?.plays.at(-1) ?? null;
  }

  get puller(): string | null {
    return this.round?.puller?.seat ?? null;
  }

  get isMyGun(): boolean {
    return this.puller === this.meId;
  }

  // The table card's tooltip, and the line under it (spec D22).
  get tableCardHint(): string {
    const rank = this.rankLabel();

    return rank ? `${this.#deps.t('round.tableCard')}: ${rank}. ${this.#deps.t('round.tableCardHint', { rank })}` : '';
  }

  // What someone holds now (spec §8.3): their cards as a fan of backs, or the gun at their head.
  poseOf(id: string): { cards: number; gun: boolean } {
    const seat = this.seat(id);
    const round = this.round;
    const gun = round?.puller?.seat === id && (round.step === 'pull' || round.step === 'pulling');

    return { cards: seat?.alive && !gun && round?.step !== 'roundOver' ? seat.cards : 0, gun };
  }

  seat(id: string): SeatSnapshot | null {
    return this.seats.find((seat) => seat.id === id) ?? null;
  }

  nameOf(id: string): string {
    return this.seat(id)?.name ?? '';
  }

  // Chambers still to pull in someone's revolver: the next pull is 1 in this many.
  chambersLeft(id: string): number {
    return gameLimits.chambers - (this.seat(id)?.used ?? 0);
  }

  // "Queens" (or "Queen"): what every play this round claims to be.
  rankLabel(many = true): string {
    const rank = this.tableRank;

    return rank ? this.#deps.t(`round.ranks.${rank}.${many ? 'many' : 'one'}`) : '';
  }

  receive(match: MatchSnapshot | null, secret: SecretSnapshot, meId: string): void {
    this.match = match;
    this.secret = secret;
    this.meId = meId;
  }
}
