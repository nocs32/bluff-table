import { defaultGameSettings } from '@bluff-table/protocol';
import { expect, test } from 'vitest';
import { pickBotName } from './bot-names.js';
import { applySettings, settingChanges } from './settings.js';

test('the turn time is clamped and rounded to its steps', () => {
  expect(applySettings(defaultGameSettings, { turnSeconds: 23 }).turnSeconds).toBe(25);
  expect(applySettings(defaultGameSettings, { turnSeconds: 0 }).turnSeconds).toBe(15);
  expect(applySettings(defaultGameSettings, { turnSeconds: 5000 }).turnSeconds).toBe(60);
});

test('a patch changes only what it names, switches included', () => {
  expect(applySettings(defaultGameSettings, { turnSeconds: 45 })).toEqual({ ...defaultGameSettings, turnSeconds: 45 });
  expect(applySettings(defaultGameSettings, {})).toEqual(defaultGameSettings);

  expect(applySettings(defaultGameSettings, { switches: { whisper: true } }).switches).toEqual({ whisper: true, doubleCall: false });
});

test('changes are listed in a fixed order: the turn time, then the switches', () => {
  const after = applySettings(defaultGameSettings, { switches: { doubleCall: true, whisper: true }, turnSeconds: 20 });

  expect(settingChanges(defaultGameSettings, after)).toEqual([
    { type: 'setting', setting: 'turnSeconds', value: 20 },
    { type: 'switch', name: 'whisper', on: true },
    { type: 'switch', name: 'doubleCall', on: true },
  ]);

  expect(settingChanges(after, after)).toEqual([]);
});

test('bots get the first free name, then a numbered one', () => {
  expect(pickBotName(new Set())).toBe('Dusty');
  expect(pickBotName(new Set(['Dusty', 'Slim']))).toBe('Hank');
  expect(pickBotName(new Set(['Dusty', 'Slim', 'Hank', 'Clem', 'Rusty', 'Lefty', 'Tex', 'Kit', 'Shorty', 'Mabel', 'Dusty 2']))).toBe('Dusty 3');
});
