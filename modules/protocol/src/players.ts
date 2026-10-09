// The player palette, one colour per seat (spec D9): saloon dyes, worn on the hat or its band
// (spec §8.3). The server gives each newcomer a colour nobody at the table has yet, and anyone can
// pick another free one in the lobby.
export const playerColors = ['red', 'green', 'blue', 'purple', 'gold', 'teal'] as const;

export type PlayerColor = (typeof playerColors)[number];

export const isPlayerColor = (value: string): value is PlayerColor => (playerColors as readonly string[]).includes(value);

export const personNameMaxLength = 32;

// A name as the table keeps it: single spaces, no spaces at the ends, at most 32 characters.
// An empty result means the name is rejected.
export const cleanPersonName = (text: string): string => text.replace(/\s+/gu, ' ').trim().slice(0, personNameMaxLength).trim();
