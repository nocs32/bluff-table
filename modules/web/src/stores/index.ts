import { createServices } from '../services';
import type { Services } from '../services/types';
import { GraphicsStore } from './graphics';
import { LocaleStore } from './locale';
import { RoomStore } from './room';
import { RuleBookStore } from './rule-book';
import { SoundStore } from './sound';
import { TableStore } from './table';
import { UiStore } from './ui';

export class RootStore {
  readonly locale: LocaleStore;
  readonly ui: UiStore;
  readonly room: RoomStore;
  readonly sound: SoundStore;
  readonly graphics: GraphicsStore;
  readonly table: TableStore;
  readonly ruleBook: RuleBookStore;

  constructor(services: Services) {
    this.locale = new LocaleStore(services);
    this.ui = new UiStore(services);
    this.ruleBook = new RuleBookStore({ t: this.locale.t, cardArt: services.cardArt, device: services.device });
    this.room = new RoomStore(services, this.locale, this.ui, this.ruleBook);
    this.sound = new SoundStore({ t: this.locale.t, sounds: services.sounds, preferences: services.preferences });
    this.graphics = new GraphicsStore({ t: this.locale.t, preferences: services.preferences, now: services.now, notify: this.ui.notice.show });
    this.table = new TableStore({ t: this.locale.t, now: services.now, sounds: services.sounds });
    this.room.game.listen((events) => this.table.receivePlay(events));
  }
}

export const createRootStore = (): RootStore => new RootStore(createServices());
