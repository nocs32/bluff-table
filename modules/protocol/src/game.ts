// The game's phases, settings and limits (spec §4, §5.10).

// Only the lobby for now: the game's own phases come with the rules (spec §10.3).
export const gamePhases = ['lobby'] as const;

export type GamePhase = (typeof gamePhases)[number];

// The twists of our own (spec §5.8, §5.9): lobby switches, both off by default, so new players
// learn the classic game first.
export const gameSwitches = ['whisper', 'doubleCall'] as const;

export type GameSwitch = (typeof gameSwitches)[number];

export type GameSwitches = Record<GameSwitch, boolean>;

export interface GameSettings {
  // How long a turn lasts before a card is played for you (D14).
  turnSeconds: number;
  switches: GameSwitches;
}

// The settings that are numbers, each set with a slider.
export type GameSettingKey = 'turnSeconds';

// A change from someone at the table: the turn time, and any of the switches.
export type GameSettingsPatch = Partial<Pick<GameSettings, GameSettingKey>> & { switches?: Partial<GameSwitches> };

export const gameLimits = {
  turnSeconds: { min: 15, max: 60, step: 5 },
  // Made for 3 to 6 (D9). Deal needs two seats filled, people or bots (§4.2).
  minPlayers: 2,
  maxPlayers: 6,
  // Everyone's own revolver: six chambers, one bullet, never re-spun (D15).
  chambers: 6,
} as const;

export const defaultGameSettings: GameSettings = {
  turnSeconds: 30,
  switches: { whisper: false, doubleCall: false },
};
