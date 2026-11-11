import type { Face } from './state';

// Last setup chosen on the home screen. Kept apart from saved games (storage.ts).
export interface Settings {
    face: Face;
}

export const DEFAULT_SETTINGS: Settings = { face: 'A' };

const SETTINGS_KEY = 'landscape.settings';

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

function defaultStore(): KeyValueStore | undefined {
    try {
        return globalThis.localStorage;
    } catch {
        return undefined; // storage blocked (private mode, disabled site data)
    }
}

// Never throws: missing, unreadable or unexpected values give the defaults
export function loadSettings(store: KeyValueStore | undefined = defaultStore()): Settings {
    try {
        const raw = store?.getItem(SETTINGS_KEY);
        if (!raw) {
            return DEFAULT_SETTINGS;
        }
        const parsed: unknown = JSON.parse(raw);
        const face = (parsed as { face?: unknown } | null)?.face;
        return face === 'A' || face === 'B' ? { face } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveSettings(settings: Settings, store: KeyValueStore | undefined = defaultStore()): void {
    try {
        store?.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
        // Not saved: the next launch falls back to the defaults
    }
}
