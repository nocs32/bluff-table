import type { CardRank } from '@bluff-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { CardArtService } from '../../../services';
import type { Translate } from '../../locale';
import type { RoomGameMatchStore } from './match';

export interface RoomGameSecretsDeps {
  t: Translate;
  match: RoomGameMatchStore;
  cardArt: CardArtService;
}

// A strip of text with a bold start.
export interface SecretStrip {
  title: string;
  line: string;
  crooked: boolean;
}

// One living player's hand, as a ghost sees it.
export interface GhostHand {
  id: string;
  name: string;
  cards: Array<{ id: string; rank: CardRank; image: string; label: string }>;
}

// What only you know (spec §5.7, §5.8, §9.2): the barkeep's whisper, if it was to you, and every
// hand once you're a ghost.
export class RoomGameSecretsStore {
  readonly #deps: RoomGameSecretsDeps;

  constructor(deps: RoomGameSecretsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // The whisper's strip: what the house is, and what it means for you. Nobody else sees it.
  get whisper(): SecretStrip | null {
    const { t, match } = this.#deps;
    const crooked = match.secret.crooked;

    if (crooked === null) return null;

    return crooked ? { title: t('round.whisper.crookedTitle'), line: t('round.whisper.crookedLine'), crooked } : { title: t('round.whisper.straightTitle'), line: t('round.whisper.straightLine'), crooked };
  }

  get isGhost(): boolean {
    return this.#deps.match.secret.ghost !== null && this.#deps.match.isGhost;
  }

  get ghostHands(): GhostHand[] {
    const { t, match, cardArt } = this.#deps;
    const sight = match.secret.ghost;

    if (!sight) return [];

    return Object.entries(sight.hands).map(([id, cards]) => ({ id, name: match.nameOf(id), cards: cards.map((card) => ({ id: card.id, rank: card.rank, image: cardArt.face(card.rank), label: t(`round.ranks.${card.rank}.one`) })) }));
  }

  get ghostLine(): string {
    return this.#deps.t('round.ghost.line');
  }
}
