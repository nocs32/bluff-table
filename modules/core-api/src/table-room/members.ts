import { pickBotName, rollCharacter } from '@bluff-table/engine';
import { cleanPersonName, playerColors, type Character, type PlayerColor } from '@bluff-table/protocol';
import { TableRoomError } from './error.js';
import { pickMemberName } from './member-names.js';

// Someone at the table: a person, keyed by their session id, or a bot sat down from the lobby.
export interface TableRoomMember {
  readonly id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
  readonly bot: boolean;
  // How they look (spec D7): a random character to start with.
  character: Character;
  // Games won tonight: their bounty on the wanted posters (D16).
  wins: number;
}

// Who is at the table, in the order they sat down. Each person is connected ⇄ reconnecting (a
// dropped connection keeps their seat for a while), then leaves. Bots are always connected.
export class TableRoomMembers {
  readonly #members = new Map<string, TableRoomMember>();
  readonly #random: () => number;

  constructor(random: () => number) {
    this.#random = random;
  }

  // Every seat taken: people (reconnecting ones included) and bots.
  get count(): number {
    return this.#members.size;
  }

  // People only: a table with nobody but bots at it is empty.
  get people(): number {
    return this.all.filter((member) => !member.bot).length;
  }

  // The bot that sat down last, if any.
  get newestBot(): TableRoomMember | undefined {
    return this.all.findLast((member) => member.bot);
  }

  get all(): TableRoomMember[] {
    return [...this.#members.values()];
  }

  has(id: string): boolean {
    return this.#members.has(id);
  }

  find(id: string): TableRoomMember | undefined {
    return this.#members.get(id);
  }

  get(id: string): TableRoomMember {
    const member = this.#members.get(id);

    if (!member) throw new TableRoomError('NOT_A_MEMBER');

    return member;
  }

  isConnected(id: string): boolean {
    return this.#members.get(id)?.connected ?? false;
  }

  // `requestedName` is the name this person picked before; without one the table makes one up.
  join(id: string, requestedName: string | null): TableRoomMember {
    if (this.#members.has(id)) throw new TableRoomError('ALREADY_A_MEMBER');

    const name = cleanPersonName(requestedName ?? '') || pickMemberName(new Set(this.all.map((member) => member.name)), this.#random);
    const member: TableRoomMember = { id, name, color: this.#freeColor(), connected: true, bot: false, character: rollCharacter(this.#random), wins: 0 };

    this.#members.set(id, member);

    return member;
  }

  // A bot gets the first bot name nobody has.
  seatBot(id: string): TableRoomMember {
    const name = pickBotName(new Set(this.all.map((other) => other.name)));
    const member: TableRoomMember = { id, name, color: this.#freeColor(), connected: true, bot: true, character: rollCharacter(this.#random), wins: 0 };

    this.#members.set(id, member);

    return member;
  }

  drop(id: string): void {
    this.get(id).connected = false;
  }

  reconnect(id: string): void {
    this.get(id).connected = true;
  }

  leave(id: string): TableRoomMember {
    const member = this.get(id);

    this.#members.delete(id);

    return member;
  }

  // A game won: returns their wins tonight (someone who already left has just the one).
  win(id: string): number {
    const member = this.#members.get(id);

    if (!member) return 1;

    member.wins += 1;

    return member.wins;
  }

  // Returns the cleaned-up name, or null when nothing changed.
  rename(id: string, text: string): string | null {
    const member = this.get(id);
    const name = cleanPersonName(text);

    if (!name) throw new TableRoomError('EMPTY_NAME');

    if (name === member.name) return null;

    member.name = name;

    return name;
  }

  // A new look and colour (spec D7). A colour someone else wears is refused, and nothing changes.
  dress(id: string, character: Character, color: PlayerColor): void {
    const member = this.get(id);

    if (this.all.some((other) => other.id !== id && other.color === color)) throw new TableRoomError('COLOR_TAKEN');

    member.character = character;
    member.color = color;
  }

  // The least used colour (unused while there are fewer people than colours), random among ties.
  #freeColor(): PlayerColor {
    const uses = new Map<PlayerColor, number>(playerColors.map((color) => [color, 0]));

    this.#members.forEach((member) => uses.set(member.color, (uses.get(member.color) ?? 0) + 1));

    const fewest = Math.min(...uses.values());
    const candidates = playerColors.filter((color) => uses.get(color) === fewest);

    return candidates[Math.floor(this.#random() * candidates.length)] ?? 'teal';
  }
}
