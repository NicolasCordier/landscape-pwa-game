import { describe, expect, it } from 'vitest';
import { loadSettings, saveSettings } from './settings';

function memoryStore(initial: Record<string, string> = {}) {
    const data = { ...initial };
    return {
        getItem: (key: string) => data[key] ?? null,
        setItem: (key: string, value: string) => { data[key] = value; },
    };
}

describe('settings', () => {
    it('round-trips the chosen face', () => {
        const store = memoryStore();
        saveSettings({ face: 'B' }, store);
        expect(loadSettings(store)).toEqual({ face: 'B' });
    });

    it('defaults to face A when nothing is saved', () => {
        expect(loadSettings(memoryStore())).toEqual({ face: 'A' });
        expect(loadSettings(undefined)).toEqual({ face: 'A' });
    });

    it('defaults to face A on invalid JSON', () => {
        expect(loadSettings(memoryStore({ 'landscape.settings': '{oops' }))).toEqual({ face: 'A' });
    });

    it('defaults to face A on an unknown face', () => {
        expect(loadSettings(memoryStore({ 'landscape.settings': '{"face":"C"}' }))).toEqual({ face: 'A' });
        expect(loadSettings(memoryStore({ 'landscape.settings': 'null' }))).toEqual({ face: 'A' });
    });

    it('does not throw when the store fails', () => {
        const broken = {
            getItem: () => { throw new Error('blocked'); },
            setItem: () => { throw new Error('blocked'); },
        };
        expect(loadSettings(broken)).toEqual({ face: 'A' });
        expect(() => saveSettings({ face: 'B' }, broken)).not.toThrow();
    });
});
