import { rollCharacter } from '@bluff-table/engine';
import {
  characterFaces,
  characterHairs,
  characterHats,
  characterScars,
  playerColors,
  type Character,
  type PlayerColor,
} from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../locale';
import type { PlayerView, RoomPresenceStore } from './presence';
import type { TableSend } from './types';

export interface RoomCharacterDeps {
  t: Translate;
  presence: RoomPresenceStore;
  send: TableSend;
  random: () => number;
  // Characters change only in the lobby (spec §4.2).
  isLobby: () => boolean;
}

// The builder's rows (spec §8.3): hat, face, hair, scar, and the straw.
export type CharacterPart = 'hat' | 'face' | 'hair' | 'scar' | 'straw';

export interface CharacterOptionView {
  value: string;
  label: string;
  picked: boolean;
}

export interface CharacterRowView {
  part: CharacterPart;
  label: string;
  options: CharacterOptionView[];
  // The part as it is now, e.g. "Stetson".
  valueLabel: string;
  // What the arrows say they do, e.g. "Hat: the next one".
  previousLabel: string;
  nextLabel: string;
}

export interface CharacterColorView {
  color: PlayerColor;
  label: string;
  picked: boolean;
  // Someone else wears it, so it can't be picked.
  taken: boolean;
}

const partValues: Record<CharacterPart, readonly string[]> = {
  hat: characterHats,
  face: characterFaces,
  hair: characterHairs,
  scar: characterScars,
  straw: ['no', 'yes'],
};

const parts: readonly CharacterPart[] = ['hat', 'face', 'hair', 'scar', 'straw'];

const valueOf = (character: Character, part: CharacterPart): string => {
  if (part === 'straw') return character.straw ? 'yes' : 'no';

  return character[part];
};

const withPart = (character: Character, part: CharacterPart, value: string): Character =>
  part === 'straw' ? { ...character, straw: value === 'yes' } : { ...character, [part]: value };

// Your character in the lobby (spec D7, §9.1): pick each part, a colour nobody else wears, or roll a
// random one. The change shows at once and goes to the table, which tells everyone.
export class RoomCharacterStore {
  readonly #deps: RoomCharacterDeps;

  constructor(deps: RoomCharacterDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get me(): PlayerView | undefined {
    return this.#deps.presence.me;
  }

  get canEdit(): boolean {
    return this.#deps.isLobby() && this.me !== undefined;
  }

  get rows(): CharacterRowView[] {
    const { t } = this.#deps;
    const character = this.me?.character;

    return parts.map((part) => {
      const label = t(`character.${part}`);
      const options = partValues[part].map((value) => ({ value, label: t(`character.${part}s.${value}` as 'character.hats.none'), picked: character ? valueOf(character, part) === value : false }));

      return {
        part,
        label,
        options,
        valueLabel: options.find((option) => option.picked)?.label ?? '',
        previousLabel: t('character.previous', { part: label }),
        nextLabel: t('character.next', { part: label }),
      };
    });
  }

  get colors(): CharacterColorView[] {
    const { t, presence } = this.#deps;
    const taken = presence.takenColors;

    return playerColors.map((color) => {
      const wearer = taken.get(color);
      const name = t(`colors.${color}`);

      return { color, label: wearer ? t('character.colorTaken', { color: name, name: wearer }) : name, picked: this.me?.color === color, taken: wearer !== undefined };
    });
  }

  pick(part: CharacterPart, value: string): void {
    const me = this.me;

    if (me && this.canEdit) this.#dress(withPart(me.character, part, value), me.color);
  }

  // The arrows beside a part: the next one along, or the one before, round and round.
  step(part: CharacterPart, by: 1 | -1): void {
    const me = this.me;

    if (!me) return;

    const values = partValues[part];
    const at = values.indexOf(valueOf(me.character, part));

    this.pick(part, values[(at + by + values.length) % values.length] ?? values[0] ?? '');
  }

  pickColor(color: PlayerColor): void {
    const me = this.me;

    if (me && this.canEdit && !this.#deps.presence.takenColors.has(color)) this.#dress(me.character, color);
  }

  // A random character, in a random colour nobody else wears.
  roll(): void {
    const me = this.me;

    if (!me || !this.canEdit) return;

    const free = playerColors.filter((color) => !this.#deps.presence.takenColors.has(color));
    const color = free[Math.floor(this.#deps.random() * free.length)] ?? me.color;

    this.#dress(rollCharacter(this.#deps.random), color);
  }

  #dress(character: Character, color: PlayerColor): void {
    const me = this.me;

    if (!me) return;

    this.#deps.presence.dress(me.id, character, color);
    this.#deps.send('dress', { character, color });
  }
}
