import type { GamePhase, GameSnapshot, Mood, PlayEvent, SecretSnapshot, TableErrorCode, TableIntentType } from '@bluff-table/protocol';
import { makeAutoObservable, reaction } from 'mobx';
import type { CardArtService, Schedule, SoundsService } from '../../../services';
import type { Translate } from '../../locale';
import type { TableSend } from '../types';
import { RoomGameCaptionsStore } from './captions';
import { RoomGameClockStore } from './clock';
import { RoomGameHandStore } from './hand';
import { RoomGameMatchStore } from './match';
import { RoomGameMoodsStore } from './moods';
import { RoomGamePullStore } from './pull';
import { RoomGameSecretsStore } from './secrets';
import { RoomGameSettingsStore } from './settings';
import { RoomGameSummaryStore } from './summary';
import { RoomGameTurnStore, type TurnPrompt } from './turn';

export interface RoomGameDeps {
  t: Translate;
  send: TableSend;
  schedule: Schedule;
  repeat: Schedule;
  now: () => number;
  sounds: SoundsService;
  cardArt: CardArtService;
  // Two seats are filled, people or bots (spec §4.2).
  isReady: () => boolean;
  // Connected to the table: the turn's sounds stop while it's lost.
  isLive: () => boolean;
  winsOf: (id: string) => number;
  openRules: () => void;
}

// How you look in your mirror: your face, what you hold, and whether you're a ghost.
export interface MirrorPose {
  mood: Mood;
  cards: number;
  gun: boolean;
  ghost: boolean;
}

// Hears about what just happened at the table: the 3D table plays it.
export type RoomGameListener = (events: readonly PlayEvent[]) => void;

// Refusals that mean the table moved on before a move got there (someone else was faster).
const lateCodes: ReadonlySet<TableErrorCode> = new Set(['NOT_YOUR_TURN', 'WRONG_PHASE', 'NOT_IN_HAND', 'NOTHING_TO_CALL', 'MUST_CALL']);

// The game as you see it: its phase (the state: lobby → round → over → round or lobby), the
// settings, the match, your hand, the turn, the gun, the faces, the captions and the summary. The
// table runs the game; this only shows it and asks.
export class RoomGameStore {
  state: GamePhase = 'lobby';
  readonly settings: RoomGameSettingsStore;
  readonly match: RoomGameMatchStore;
  readonly clock: RoomGameClockStore;
  readonly hand: RoomGameHandStore;
  readonly turn: RoomGameTurnStore;
  readonly pull: RoomGamePullStore;
  readonly moods: RoomGameMoodsStore;
  readonly captions: RoomGameCaptionsStore;
  readonly secrets: RoomGameSecretsStore;
  readonly summary: RoomGameSummaryStore;
  #listeners: RoomGameListener[] = [];
  #stopFuse: (() => void) | null = null;
  readonly #deps: RoomGameDeps;

  constructor(deps: RoomGameDeps) {
    const { t, send, schedule, now, cardArt } = deps;

    this.#deps = deps;
    this.settings = new RoomGameSettingsStore({ t, send, isEditable: () => this.state === 'lobby' });
    this.match = new RoomGameMatchStore({ t });
    this.clock = new RoomGameClockStore({ now, repeat: deps.repeat });
    this.hand = new RoomGameHandStore({ t, send, match: this.match, cardArt });
    this.turn = new RoomGameTurnStore({ t, send, match: this.match, clock: this.clock, schedule, doubleCall: () => this.settings.switches.doubleCall });
    this.pull = new RoomGamePullStore({ t, send, match: this.match, clock: this.clock, cardArt });
    this.moods = new RoomGameMoodsStore({ t, send, match: this.match, now });
    this.captions = new RoomGameCaptionsStore({ t, match: this.match, schedule });
    this.secrets = new RoomGameSecretsStore({ t, match: this.match, cardArt });
    this.summary = new RoomGameSummaryStore({ t, send, match: this.match, winsOf: deps.winsOf });
    makeAutoObservable(this, {}, { autoBind: true });
    this.#listenForSounds();
  }

  get isLobby(): boolean {
    return this.state === 'lobby';
  }

  get isPlaying(): boolean {
    return this.state === 'round';
  }

  get isOver(): boolean {
    return this.state === 'over';
  }

  get canDeal(): boolean {
    return this.isLobby && this.#deps.isReady();
  }

  get dealHint(): string {
    return this.canDeal ? this.#deps.t('lobby.dealHint') : this.#deps.t('lobby.dealWaiting');
  }

  // The table card, on show in the prompt (spec D22): its picture, and its name.
  get tableCard(): { image: string; label: string; hint: string } | null {
    const rank = this.match.tableRank;

    return rank ? { image: this.#deps.cardArt.face(rank), label: this.match.rankLabel(), hint: this.match.tableCardHint } : null;
  }

  // The seconds left on your turn, on the prompt.
  get timeLabel(): string {
    return this.match.isMyTurn ? this.#deps.t('round.turn.seconds', { count: this.turn.secondsLeft }) : '';
  }

  // What's going on, for the prompt at the top left.
  get prompt(): TurnPrompt | null {
    if (!this.isPlaying) return null;

    return this.turn.prompt ?? this.pull.prompt;
  }

  // You in your mirror, read every frame (spec §7.1, §8.4).
  myPose(): MirrorPose {
    const me = this.match.meId;
    const ghost = this.match.isGhost;

    return { mood: this.moods.moodOf(me, ghost), ...(ghost ? { cards: 0, gun: false } : this.match.poseOf(me)), ghost };
  }

  // Deal the cards (spec §4.2).
  deal(): void {
    if (this.canDeal) this.#deps.send('start', {});
  }

  openRules(): void {
    this.#deps.openRules();
  }

  receive(game: GameSnapshot, secret: SecretSnapshot, meId: string): void {
    this.state = game.phase;
    this.settings.receive(game.settings);
    this.match.receive(game.match, secret, meId);
    this.hand.tidy();
    this.pull.tidy();

    if (game.phase === 'round') this.clock.start();
    else this.clock.stop();

    if (game.phase === 'lobby') {
      this.captions.clear();
      this.moods.clear();
    }
  }

  receivePlay(events: readonly PlayEvent[]): void {
    this.captions.receive(events);
    this.moods.receive(events);
    this.#playSounds(events);
    this.#listeners.forEach((listener) => listener(events));
  }

  // A move the table turned down: a line says why (spec D22).
  receiveRefusal(type: TableIntentType, code: TableErrorCode): void {
    const t = this.#deps.t;

    if (code === 'DOUBLE_USED') this.captions.note(t('round.refused.doubleUsed'));
    else if (lateCodes.has(code) && ['play', 'call', 'pull'].includes(type)) this.captions.note(t('round.refused.late'));
  }

  listen(listener: RoomGameListener): void {
    this.#listeners = [...this.#listeners, listener];
  }

  #playSounds(events: readonly PlayEvent[]): void {
    const { sounds } = this.#deps;

    events.forEach((event) => {
      if (event.type === 'dealt') sounds.play('shuffle');

      if (event.type === 'played') sounds.play('slap');
    });
  }

  // The turn's sounds (spec §7.4): a chime when it's your turn, and the fuse hissing while your
  // last seconds burn.
  #listenForSounds(): void {
    const { sounds, isLive } = this.#deps;

    reaction(
      () => this.isPlaying && this.match.isMyTurn,
      (mine) => mine && sounds.play('chime'),
    );

    reaction(
      () => this.isPlaying && this.turn.isBurning && isLive(),
      (burning) => {
        this.#stopFuse?.();
        this.#stopFuse = burning ? sounds.loop('fuse') : null;
      },
    );
  }
}
