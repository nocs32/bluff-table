// Public API of the game engine: pure logic, no DOM, no Node. The rules, the bots and the
// simulations are shared by the server, the demo table and the rule book (spec §10.3).
export { botNames, pickBotName } from './bot-names.js';
export { botMove, botPersonalities, randomMove, suspicion, type BotPersonality } from './bots.js';
export { buildDeck, isTrue, isTruthful, liesIn, truthfulInDeck } from './cards.js';
export { rollCharacter } from './characters.js';
export { callVerdict, ruleBookExamples, type CallExample, type CallVerdict } from './examples.js';
export * from './game/index.js';
export { simulateGame, type Brain, type SimulatedGame } from './game/simulate.js';
export { angleOfLook, lookAtAngle, lookAtMember, lookOnTable, seatSlots, tableLayout } from './heads.js';
export { createRandom, randomBetween, shuffle } from './random.js';
export { applySettings, settingChanges, type SettingChange } from './settings.js';
