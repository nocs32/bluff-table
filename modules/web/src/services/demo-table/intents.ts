import type { Character, GameSettingsPatch, PlayerColor, TableIntents, TableIntentType, WheelMood } from '@bluff-table/protocol';
import type { Move } from '@bluff-table/engine';

export type DemoHandlers = { [K in TableIntentType]: (memberId: string, message: TableIntents[K]) => void };

// What the referee does about the table.
export interface DemoMoves {
  updateSettings: (memberId: string, patch: GameSettingsPatch) => void;
  chat: (memberId: string, text: string) => void;
  rename: (memberId: string, name: string) => void;
  addBot: (memberId: string) => void;
  removeBot: (memberId: string, botId: string) => void;
  dress: (memberId: string, character: Character, color: PlayerColor) => void;
  look: (memberId: string, x: number, y: number) => void;
  face: (memberId: string, mood: WheelMood) => void;
  start: (memberId: string) => void;
  move: (memberId: string, move: Move) => void;
  pull: (memberId: string) => void;
  playAgain: (memberId: string) => void;
  toLobby: (memberId: string) => void;
}

const ignore = (): void => undefined;

// Each intent and the move that answers it. Reactions and faces matter only to other people, and
// at the demo table everyone else is a sample player or a bot. The demo sends everything as it
// changes, so `sync` has nothing to catch up on.
export const demoHandlers = (moves: DemoMoves): DemoHandlers => ({
  sync: ignore,
  updateSettings: (id, patch) => moves.updateSettings(id, patch),
  chat: (id, { text }) => moves.chat(id, text),
  react: ignore,
  rename: (id, { name }) => moves.rename(id, name),
  addBot: (id) => moves.addBot(id),
  removeBot: (id, { memberId }) => moves.removeBot(id, memberId),
  dress: (id, { character, color }) => moves.dress(id, character, color),
  look: (id, { x, y }) => moves.look(id, x, y),
  face: (id, { mood }) => moves.face(id, mood),
  start: (id) => moves.start(id),
  play: (id, { cardIds }) => moves.move(id, { type: 'play', cardIds }),
  call: (id, { double }) => moves.move(id, { type: 'call', double }),
  pull: (id) => moves.pull(id),
  playAgain: (id) => moves.playAgain(id),
  toLobby: (id) => moves.toLobby(id),
});
