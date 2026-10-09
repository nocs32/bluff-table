import { defaultGameSettings, gameLimits, gameSwitches, type GameSettingKey, type GameSettings, type GameSwitch, type GameSwitches } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { RuleBookSection } from '../../rule-book';
import type { TableSend } from '../types';

export interface RoomGameSettingsDeps {
  t: Translate;
  send: TableSend;
  // Settings change only between games (spec §5.10).
  isEditable: () => boolean;
}

// idle → dragging (a slider is held: the table's values don't overwrite it).
export type RoomGameSettingsState = 'idle' | 'dragging';

// A switch as the lobby's card and the table's tent cards show it: its name, one line saying what
// it does (spec D22), and whether it's on.
export interface SwitchView {
  name: GameSwitch;
  label: string;
  hint: string;
  on: boolean;
  // Its part of the rule book, a click away (spec §9.1).
  section: RuleBookSection;
  more: string;
}

const switchSections: Record<GameSwitch, RuleBookSection> = { whisper: 'whisper', doubleCall: 'double' };

// A number setting as its slider shows it: what it's called, its value, and what it does.
export interface SettingSliderView {
  key: GameSettingKey;
  label: string;
  valueText: string;
  hint: string;
  value: number;
  range: { min: number; max: number; step: number };
  preview: (values: number[]) => void;
}

// The lobby's settings card (spec §5.10). Values come from the table; a slider shows where you
// drag at once and sends when you let go, and a switch sends at once. Anyone at the table may
// change them.
export class RoomGameSettingsStore {
  state: RoomGameSettingsState = 'idle';
  turnSeconds = defaultGameSettings.turnSeconds;
  switches: GameSwitches = { ...defaultGameSettings.switches };
  readonly limits = gameLimits;
  readonly #deps: RoomGameSettingsDeps;

  constructor(deps: RoomGameSettingsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { limits: false }, { autoBind: true });
  }

  get isEditable(): boolean {
    return this.#deps.isEditable();
  }

  get turnTimeLabel(): string {
    return this.#deps.t('lobby.seconds', { count: this.turnSeconds });
  }

  get turnTime(): SettingSliderView {
    const { t } = this.#deps;

    return { key: 'turnSeconds', label: t('lobby.turnTime'), valueText: this.turnTimeLabel, hint: t('lobby.turnTimeHint'), value: this.turnSeconds, range: gameLimits.turnSeconds, preview: this.previewTurnSeconds };
  }

  get switchViews(): SwitchView[] {
    const { t } = this.#deps;

    return gameSwitches.map((name) => ({ name, label: t(`switches.${name}.name`), hint: t(`switches.${name}.hint`), on: this.switches[name], section: switchSections[name], more: t('switches.more', { name: t(`switches.${name}.name`) }) }));
  }

  // The switches that are on, as the table's tent cards show them.
  get activeSwitches(): SwitchView[] {
    return this.switchViews.filter((view) => view.on);
  }

  receive(settings: GameSettings): void {
    this.switches = settings.switches;

    if (this.state === 'dragging') return;

    this.turnSeconds = settings.turnSeconds;
  }

  previewTurnSeconds(values: number[]): void {
    this.state = 'dragging';
    this.turnSeconds = values[0] ?? this.turnSeconds;
  }

  commitSliders(): void {
    this.state = 'idle';
    this.#deps.send('updateSettings', { turnSeconds: this.turnSeconds });
  }

  // Shows the switch flipped at once; the table confirms it with everyone.
  setSwitch(name: GameSwitch, on: boolean): void {
    const patch: Partial<GameSwitches> = {};

    patch[name] = on;
    this.switches = { ...this.switches, ...patch };
    this.#deps.send('updateSettings', { switches: patch });
  }
}
