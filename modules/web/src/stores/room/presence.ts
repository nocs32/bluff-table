import type { Character, MemberSnapshot } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { PortraitService } from '../../services';
import type { Translate } from '../locale';
import type { PlayerColor, PresenceStatus } from './types';

export interface PlayerView {
  id: string;
  name: string;
  initial: string;
  color: PlayerColor;
  status: PresenceStatus;
  isMe: boolean;
  isBot: boolean;
  // Shown after the name: "you", "bot", "reconnecting" or nothing.
  note: string;
  character: Character;
  // Their face, drawn by code, for chips and lists.
  portrait: string;
  // Tonight's wins, in dollars (spec D16): on their wanted poster.
  bounty: string;
  // The poster's reward line.
  reward: string;
}

export interface RoomPresenceDeps {
  t: Translate;
  portraits: PortraitService;
}

const stackSize = 5;

// Who is at the table, in the order they sat down. Each person is online ⇄ reconnecting; bots are
// always there.
export class RoomPresenceStore {
  members: MemberSnapshot[] = [];
  meId = '';
  readonly #deps: RoomPresenceDeps;

  constructor(deps: RoomPresenceDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get views(): PlayerView[] {
    return this.members.map((member) => this.#toView(member));
  }

  get stack(): PlayerView[] {
    return this.views.slice(0, stackSize);
  }

  get overflow(): number {
    return Math.max(0, this.members.length - stackSize);
  }

  get hasOverflow(): boolean {
    return this.overflow > 0;
  }

  get count(): number {
    return this.members.length;
  }

  get countLabel(): string {
    return this.#deps.t('people.count', { number: this.count });
  }

  get showLabel(): string {
    return this.#deps.t('people.show', { number: this.count });
  }

  // The wanted posters on the wall: the four highest bounties tonight (everyone's is $0 until the
  // games are played).
  get posters(): PlayerView[] {
    return this.views.slice(0, 4);
  }

  get bots(): PlayerView[] {
    return this.views.filter((view) => view.isBot);
  }

  get me(): PlayerView | undefined {
    return this.views.find((view) => view.isMe);
  }

  find(id: string): PlayerView | undefined {
    return this.views.find((view) => view.id === id);
  }

  receive(members: MemberSnapshot[], meId: string): void {
    this.members = members;
    this.meId = meId;
  }

  get ids(): string[] {
    return this.members.map((member) => member.id);
  }

  // Colours someone other than you wears.
  get takenColors(): Map<PlayerColor, string> {
    return new Map(this.members.filter((member) => member.id !== this.meId).map((member) => [member.color, member.name]));
  }

  // Shows a new look before the table confirms it.
  dress(id: string, character: Character, color: PlayerColor): void {
    this.members = this.members.map((member) => (member.id === id ? { ...member, character, color } : member));
  }

  // Shows a new name before the table confirms it.
  rename(id: string, name: string): void {
    this.members = this.members.map((member) => (member.id === id ? { ...member, name } : member));
  }

  #toView(member: MemberSnapshot): PlayerView {
    const isMe = member.id === this.meId;

    return {
      id: member.id,
      name: member.name,
      initial: member.name.charAt(0).toUpperCase(),
      color: member.color,
      status: member.connected ? 'online' : 'reconnecting',
      isMe,
      isBot: member.bot,
      note: this.#noteFor(member, isMe),
      character: member.character,
      portrait: this.#deps.portraits.portrait(member.character, member.color),
      bounty: this.#deps.t('people.bounty', { amount: 0 }),
      reward: this.#deps.t('table.reward', { amount: 0 }),
    };
  }

  #noteFor(member: MemberSnapshot, isMe: boolean): string {
    const { t } = this.#deps;

    if (isMe) return t('people.you');

    if (member.bot) return t('people.bot');

    return member.connected ? '' : t('people.reconnecting');
  }
}
