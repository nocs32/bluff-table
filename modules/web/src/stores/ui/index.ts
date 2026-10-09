import type { Services } from '../../services';
import { UiLayoutStore } from './layout';
import { UiNoticeStore } from './notice';
import { UiWidgetsStore } from './widgets';

// This browser's own UI state: never shared with the table.
export class UiStore {
  readonly widgets: UiWidgetsStore;
  readonly layout = new UiLayoutStore();
  readonly notice: UiNoticeStore;

  constructor(services: Services) {
    this.widgets = new UiWidgetsStore({ preferences: services.preferences });
    this.notice = new UiNoticeStore({ schedule: services.schedule });
  }
}
