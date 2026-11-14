import { describe, expect, it } from 'vitest';
import { buildGrid, gameReducer, newGame } from './state';
import type { GameAction, GameState } from './state';
import { SAVE_VERSION, clearCurrentGame, loadCurrentGame, parseSavedGame, saveCurrentGame } from './storage';

const KEY = 'landscape_current_game';

function memoryStore(initial: Record<string, string> = {}) {
    const data: Record<string, string> = { ...initial };
    return {
        data,
        getItem:    (key: string) => data[key] ?? null,
        setItem:    (key: string, value: string) => { data[key] = value; },
        removeItem: (key: string) => { delete data[key]; },
    };
}

function run(state: GameState, ...actions: GameAction[]): GameState {
    return actions.reduce(gameReducer, state);
}

// Turn 1, a group taken and a single token placed: two tokens left to place
function midTurn(seed = 7, face: 'A' | 'B' = 'A'): GameState {
    const started = run(newGame(seed, face), { type: 'CHOOSE_SPIRIT', cardId: null }, { type: 'TAKE_GROUP', index: 1 });
    const firstCell = buildGrid(face, started.board).flat()[0];
    return run(started, { type: 'PLACE_TOKEN', tokenIndex: 0, cellId: firstCell.id });
}

function raw(state: unknown, version = SAVE_VERSION): string {
    return JSON.stringify({ version, state });
}

// Plays the remaining tokens on the first empty cells, then ends the turn
function finishTurn(state: GameState): GameState {
    let s = state;
    while (s.tokensToPlace.length > 0) {
        const cells = buildGrid(s.face, s.board).flat();
        const target = cells.find(c => c.canStack(s.tokensToPlace[0]))!;
        s = gameReducer(s, { type: 'PLACE_TOKEN', tokenIndex: 0, cellId: target.id });
    }
    return gameReducer(s, { type: 'END_TURN' });
}

describe('parseSavedGame', () => {
    it('accepts a game in progress', () => {
        const state = midTurn();
        expect(parseSavedGame(raw(state))).toEqual(state);
    });

    it('accepts a game waiting for the spirit choice, on both faces', () => {
        for (const face of ['A', 'B'] as const) {
            const state = newGame(3, face);
            expect(parseSavedGame(raw(state))).toEqual(state);
        }
    });

    it('rejects invalid JSON', () => {
        expect(parseSavedGame('{oops')).toBeNull();
        expect(parseSavedGame('null')).toBeNull();
    });

    it('rejects another version', () => {
        expect(parseSavedGame(raw(midTurn(), 1))).toBeNull();
        expect(parseSavedGame(raw(midTurn(), SAVE_VERSION + 1))).toBeNull();
    });

    it('rejects a finished game', () => {
        expect(parseSavedGame(raw({ ...midTurn(), status: 'over' }))).toBeNull();
    });

    it('rejects a board of the wrong size for the face', () => {
        expect(parseSavedGame(raw({ ...midTurn(7, 'A'), face: 'B' }))).toBeNull();
    });

    it('rejects an unknown card id, in the game or in the turn snapshot', () => {
        const state = midTurn();
        const badOffer = { ...state, cardOffer: ['no-such-card', ...state.cardOffer.slice(1)] };
        expect(parseSavedGame(raw(badOffer))).toBeNull();
        const badSnapshot = { ...state, turnStart: { ...state.turnStart, cardDeck: ['no-such-card'] } };
        expect(parseSavedGame(raw(badSnapshot))).toBeNull();
        expect(parseSavedGame(raw({ ...state, spirit: 'no-such-spirit' }))).toBeNull();
    });
});

describe('current game storage', () => {
    it('round-trips a game', () => {
        const store = memoryStore();
        const state = midTurn();
        saveCurrentGame(state, store);
        expect(loadCurrentGame(store)).toEqual(state);
    });

    it('returns null when nothing is saved', () => {
        expect(loadCurrentGame(memoryStore())).toBeNull();
        expect(loadCurrentGame(undefined)).toBeNull();
    });

    it('removes a save that cannot be resumed', () => {
        const store = memoryStore({ [KEY]: '{oops' });
        expect(loadCurrentGame(store)).toBeNull();
        expect(store.data[KEY]).toBeUndefined();
    });

    it('clears the save', () => {
        const store = memoryStore();
        saveCurrentGame(midTurn(), store);
        clearCurrentGame(store);
        expect(loadCurrentGame(store)).toBeNull();
    });

    it('does not throw when the store fails', () => {
        const fail = () => { throw new Error('blocked'); };
        const broken = { getItem: fail, setItem: fail, removeItem: fail };
        expect(() => saveCurrentGame(midTurn(), broken)).not.toThrow();
        expect(loadCurrentGame(broken)).toBeNull();
        expect(() => clearCurrentGame(broken)).not.toThrow();
    });
});

describe('resuming a saved game', () => {
    function reloaded(state: GameState): GameState {
        const store = memoryStore();
        saveCurrentGame(state, store);
        return loadCurrentGame(store)!;
    }

    it('restarts the turn to its start, tokens placed before the interruption included', () => {
        const state = midTurn();
        const restarted = gameReducer(reloaded(state), { type: 'RESTART_TURN' });
        expect(restarted).toEqual(gameReducer(state, { type: 'RESTART_TURN' }));
        expect(restarted.board.every(c => c.stack.length === 0)).toBe(true);
        expect(restarted.tokensToPlace).toEqual([]);
    });

    it('goes on with the same offers as an uninterrupted game', () => {
        const state = midTurn();
        expect(finishTurn(reloaded(state))).toEqual(finishTurn(state));
    });
});
