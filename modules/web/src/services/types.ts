import type { Character, PlayerColor, TableErrorEvent, TableFaceEvent, TableIntents, TableIntentType, TableLookEvent, TableReactionEvent, TableSnapshot } from '@bluff-table/protocol';
import type { Language, TranslationKey, TranslationValues } from '../i18n';
import type { WidgetPreference } from '../stores/ui/widgets/types';
import type { soundCues } from './sounds';

export interface SoundPreference {
  // 0–100.
  volume: number;
  muted: boolean;
}

// The 3D table's graphics (spec §8.5): lighter by itself when the game stutters, or set by hand.
export type GraphicsPreference = 'auto' | 'full' | 'light';

// This browser's own settings, kept in localStorage.
export interface PreferencesService {
  loadLanguage: () => Language | null;
  saveLanguage: (language: Language) => void;
  loadName: () => string | null;
  saveName: (name: string) => void;
  loadSound: () => SoundPreference | null;
  saveSound: (sound: SoundPreference) => void;
  loadGraphics: () => GraphicsPreference | null;
  saveGraphics: (graphics: GraphicsPreference) => void;
  // Where the floating chat sits, and whether it's open.
  loadWidget: (key: string) => WidgetPreference | null;
  saveWidget: (key: string, preference: WidgetPreference) => void;
}

// The game's cues (spec §7.4), listed in services/sounds.ts.
export type SoundCue = (typeof soundCues)[number];

// How loud (0 to 1, on top of the cue's own level) and how high (1 as recorded).
export interface SoundPlay {
  level?: number;
  rate?: number;
}

// The table's sounds (spec §7.4): CC0 recordings, quiet until the page is first clicked.
export interface SoundsService {
  play: (cue: SoundCue, options?: SoundPlay) => void;
  // Plays it over and over until the returned function stops it.
  loop: (cue: SoundCue, options?: SoundPlay) => () => void;
  // 0 is silent, 1 is full volume.
  setLevel: (level: number) => void;
}

// What kind of pointer this device has: a mouse, or a finger.
export interface DeviceService {
  isTouch: () => boolean;
}

// Little pictures of people's faces, drawn by code, for chips and lists (spec §8.6): an image URL.
export interface PortraitService {
  portrait: (character: Character, color: PlayerColor) => string;
}

export interface TranslatorService {
  translate: (language: Language, key: TranslationKey, values?: TranslationValues) => string;
  formatTime: (language: Language, at: number) => string;
}

export interface ClipboardService {
  writeText: (text: string) => Promise<void>;
}

// Runs `callback` later (once, or on an interval) and returns a function that cancels it.
export type Schedule = (callback: () => void, delayMs: number) => () => void;

// The table's address: /r/:roomId.
export interface AddressService {
  roomId: () => string | null;
  showRoom: (roomId: string) => void;
  // Goes to `/`, which sets up a new table.
  startNew: () => void;
  reload: () => void;
}

export interface TableLinkListeners {
  snapshot: (snapshot: TableSnapshot) => void;
  // Someone else's reaction.
  reaction: (event: TableReactionEvent) => void;
  // Where someone else's head points now (spec §7.1), and the face they pull (§7.2).
  look: (event: TableLookEvent) => void;
  face: (event: TableFaceEvent) => void;
  // The connection dropped (the table holds the seat for a while), or came back.
  connection: (state: TableConnectionState) => void;
  // The seat is gone for good: the table closed, or getting back in took too long.
  closed: () => void;
  // The table refused something this browser asked for.
  refused: (event: TableErrorEvent) => void;
}

export type TableConnectionState = 'live' | 'reconnecting';

// Why a table couldn't be opened: it was cleared, it's full, this web app is out of date, or the
// server can't be reached.
export type TableOpenFailure = 'gone' | 'full' | 'outdated' | 'unreachable';

export type TableOpenResult = { ok: true; link: TableLink } | { ok: false; failure: TableOpenFailure };

// Buttons for trying the game alone: only the demo table has them.
export interface DemoControls {
  addPlayer: () => void;
  removePlayer: () => void;
}

// An open table: who you are there, and a way to ask for things.
export interface TableLink {
  readonly roomId: string;
  readonly meId: string;
  readonly demo: DemoControls | null;
  send: <T extends TableIntentType>(type: T, message: TableIntents[T]) => void;
  close: () => void;
}

export interface TableClientService {
  // Joins the table at `roomId`, or sets up a new one when it's null.
  open: (roomId: string | null, name: string | null, listeners: TableLinkListeners) => Promise<TableOpenResult>;
}

// Everything stores need from the outside world, created once in index.tsx.
export interface Services {
  preferences: PreferencesService;
  translator: TranslatorService;
  clipboard: ClipboardService;
  address: AddressService;
  tableClient: TableClientService;
  sounds: SoundsService;
  portraits: PortraitService;
  device: DeviceService;
  schedule: Schedule;
  repeat: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
  origin: string;
  // The browser's languages, most preferred first (navigator.languages).
  browserLanguages: readonly string[];
}
