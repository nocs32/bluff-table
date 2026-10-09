// The table's settings (spec §5.10): a change from anyone at the table, kept within the limits.
import { gameLimits, gameSwitches, type GameSettingKey, type GameSettings, type GameSettingsPatch, type GameSwitch } from '@bluff-table/protocol';

interface Range {
  min: number;
  max: number;
  step?: number;
}

const clamp = (value: number, { min, max, step = 1 }: Range): number => Math.min(max, Math.max(min, Math.round(value / step) * step));

export const applySettings = (current: GameSettings, patch: GameSettingsPatch): GameSettings => ({
  turnSeconds: clamp(patch.turnSeconds ?? current.turnSeconds, gameLimits.turnSeconds),
  switches: { ...current.switches, ...patch.switches },
});

// One change, as the feed line that announces it.
export type SettingChange = { type: 'setting'; setting: GameSettingKey; value: number } | { type: 'switch'; name: GameSwitch; on: boolean };

const numberKeys: readonly GameSettingKey[] = ['turnSeconds'];

// What differs, in a fixed order: the numbers, then the switches (one feed line each).
export const settingChanges = (before: GameSettings, after: GameSettings): SettingChange[] => [
  ...numberKeys.filter((key) => before[key] !== after[key]).map((setting): SettingChange => ({ type: 'setting', setting, value: after[setting] })),
  ...gameSwitches.filter((name) => before.switches[name] !== after.switches[name]).map((name): SettingChange => ({ type: 'switch', name, on: after.switches[name] })),
];
