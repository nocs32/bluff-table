// Public API of the game engine: pure logic, no DOM, no Node. The rules, the bots and the
// simulations come in M1 (spec §10.3, §12).
export { botNames, pickBotName } from './bot-names.js';
export { createRandom, randomBetween, shuffle } from './random.js';
export { applySettings, settingChanges, type SettingChange } from './settings.js';
