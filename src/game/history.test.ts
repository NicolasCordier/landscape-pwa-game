import { describe, expect, it } from 'vitest';
import {
    HISTORY_VERSION, addRecord, byDate, leaderboard, loadHistory, parseHistory, placement, recordOf, saveHistory,
} from './history';
import type { GameRecord } from './history';
import { gameReducer, newGame, scoreOf } from './state';
import type { CellState, Face, GameState } from './state';

function memoryStore(initial: Record<string, string> = {}) {
    const data: Record<string, string> = { ...initial };
    return {
        data,
        getItem:    (key: string) => data[key] ?? null,
        setItem:    (key: string, value: string) => { data[key] = value; },
        removeItem: (key: string) => { delete data[key]; },
    };
}

const failingStore = {
    getItem:    () => { throw new Error('blocked'); },
    setItem:    () => { throw new Error('blocked'); },
    removeItem: () => { throw new Error('blocked'); },
};

function emptyBoard(face: Face): CellState[] {
    return newGame(1, face).board;
}

// A valid record; the score categories add up to `total`
function rec(id: string, total: number, endedAt: string, face: Face = 'A'): GameRecord {
    return {
        id,
        endedAt,
        face,
        turns: 12,
        score: { trees: total, mountains: 0, fields: 0, buildings: 0, river: 0, animals: 0, spirit: 0, total },
        board: emptyBoard(face),
        cards: [{ cardId: 'fish', cubesPlaced: 2, cubesTotal: 4, points: 6 }],
        spirit: null,
    };
}

const day = (n: number) => new Date(Date.UTC(2026, 10, n)).toISOString();

function raw(records: unknown[], version = HISTORY_VERSION): string {
    return JSON.stringify({ version, records });
}

// Game over with a finished 3-cube card, a 3-cube card with one cube, and the given spirit state
function finishedGame(spirit: 'none' | 'placed' | 'in-hand'): GameState {
    const start = { ...newGame(5, 'A', 'game-1'), spiritOffer: ['ram', 'owl'] };
    const chosen = gameReducer(start, { type: 'CHOOSE_SPIRIT', cardId: spirit === 'none' ? null : 'ram' });
    const board = chosen.board.map(c => ({ ...c, stack: [...c.stack] }));
    board[0].stack = ['GRAY', 'GRAY', 'GRAY'];
    board[1].stack = ['GRAY', 'GRAY'];
    const s: GameState = { ...chosen, board };
    const withRam = spirit === 'placed'
        ? gameReducer(s, { type: 'PLACE_CUBE', cardId: 'ram', cellId: '0-0' })
        : s;
    return {
        ...withRam,
        hand:      [...withRam.hand, { cardId: 'crocodile', cubeIndex: 2 }],
        completed: [...withRam.completed, { cardId: 'otter', cubeIndex: 0 }],
        turn:      17,
        status:    'over',
    };
}

describe('recordOf', () => {
    it('keeps the face, turns, score and board of the game', () => {
        const state = finishedGame('none');
        const record = recordOf(state, day(3));
        expect(record).toMatchObject({ id: 'game-1', endedAt: day(3), face: 'A', turns: 17 });
        expect(record.score).toEqual(scoreOf(state));
        expect(record.board).toEqual(state.board);
    });

    it('records finished cards and cards still in hand with their cubes and points', () => {
        const record = recordOf(finishedGame('none'), day(3));
        expect(record.cards).toEqual([
            { cardId: 'otter', cubesPlaced: 3, cubesTotal: 3, points: 16 },
            { cardId: 'crocodile', cubesPlaced: 1, cubesTotal: 3, points: 4 },
        ]);
    });

    it('does not record discarded cards', () => {
        const state = finishedGame('none');
        const ids = recordOf(state, day(3)).cards.map(c => c.cardId);
        expect(ids).not.toContain(state.cardOffer[0]);
        expect(ids).toHaveLength(2);
    });

    it('records a spirit whose cube is placed, with its bonus', () => {
        const state = finishedGame('placed');
        const record = recordOf(state, day(3));
        expect(record.spirit).toEqual({ cardId: 'ram', cubePlaced: true, points: scoreOf(state).spirit });
        expect(record.spirit!.points).toBeGreaterThan(0);
        expect(record.cards.map(c => c.cardId)).not.toContain('ram');
    });

    it('records a spirit still in hand with 0 points', () => {
        const record = recordOf(finishedGame('in-hand'), day(3));
        expect(record.spirit).toEqual({ cardId: 'ram', cubePlaced: false, points: 0 });
        expect(record.cards.map(c => c.cardId)).not.toContain('ram');
    });

    it('records no spirit when none was taken', () => {
        expect(recordOf(finishedGame('none'), day(3)).spirit).toBeNull();
    });

    it('gives a record that reads back unchanged', () => {
        const record = recordOf(finishedGame('placed'), day(3));
        expect(parseHistory(raw([record]))).toEqual([record]);
    });
});

describe('addRecord', () => {
    it('adds a new game', () => {
        expect(addRecord([rec('a', 10, day(1))], rec('b', 20, day(2))).map(r => r.id)).toEqual(['a', 'b']);
    });

    it('does not add the same game twice', () => {
        const history = addRecord([], rec('a', 10, day(1)));
        expect(addRecord(history, rec('a', 10, day(1)))).toBe(history);
    });
});

describe('leaderboard', () => {
    const history = [
        rec('a1', 50, day(1)), rec('a2', 70, day(2)), rec('a3', 60, day(3)),
        rec('b1', 99, day(4), 'B'),
    ];

    it('sorts the games of a face by total, highest first', () => {
        expect(leaderboard(history, 'A').map(r => r.id)).toEqual(['a2', 'a3', 'a1']);
        expect(leaderboard(history, 'B').map(r => r.id)).toEqual(['b1']);
    });

    it('puts the older game first on a tie', () => {
        const tied = [rec('new', 60, day(9)), rec('old', 60, day(2))];
        expect(leaderboard(tied, 'A').map(r => r.id)).toEqual(['old', 'new']);
    });

    it('keeps the 10 best games', () => {
        const many = Array.from({ length: 12 }, (_, i) => rec(`g${i}`, i, day(i + 1)));
        const top = leaderboard(many, 'A');
        expect(top).toHaveLength(10);
        expect(top[0].id).toBe('g11');
        expect(top[9].id).toBe('g2');
    });

    it('is empty for a face without games', () => {
        expect(leaderboard([rec('a', 10, day(1))], 'B')).toEqual([]);
    });
});

describe('placement', () => {
    it('is a new record when the total beats every game of the face', () => {
        const history = [rec('old', 68, day(1)), rec('b', 90, day(2), 'B'), rec('new', 71, day(3))];
        expect(placement(history, 'new')).toEqual({ rank: 1, isRecord: true });
    });

    it('gives the rank when the game enters the leaderboard', () => {
        const history = [rec('x', 80, day(1)), rec('y', 75, day(2)), rec('new', 70, day(3)), rec('z', 60, day(4))];
        expect(placement(history, 'new')).toEqual({ rank: 3, isRecord: false });
    });

    it('is 2nd, not a record, when the game ties the record', () => {
        const history = [rec('old', 68, day(1)), rec('new', 68, day(3))];
        expect(placement(history, 'new')).toEqual({ rank: 2, isRecord: false });
    });

    it('is null outside the 10 best games', () => {
        const better = Array.from({ length: 10 }, (_, i) => rec(`g${i}`, 100 + i, day(i + 1)));
        expect(placement([...better, rec('new', 50, day(20))], 'new')).toBeNull();
    });

    it('is a new record for the first game on a face', () => {
        const history = [rec('a', 90, day(1)), rec('first-b', 20, day(2), 'B')];
        expect(placement(history, 'first-b')).toEqual({ rank: 1, isRecord: true });
    });
});

describe('byDate', () => {
    it('lists the newest game first', () => {
        const history = [rec('a', 10, day(1)), rec('c', 10, day(3), 'B'), rec('b', 10, day(2))];
        expect(byDate(history).map(r => r.id)).toEqual(['c', 'b', 'a']);
    });
});

describe('parseHistory', () => {
    it('accepts a valid history', () => {
        const history = [rec('a', 10, day(1)), rec('b', 20, day(2), 'B')];
        expect(parseHistory(raw(history))).toEqual(history);
    });

    it('gives an empty history for unreadable data or another version', () => {
        expect(parseHistory('{oops')).toEqual([]);
        expect(parseHistory('null')).toEqual([]);
        expect(parseHistory(JSON.stringify({ version: HISTORY_VERSION }))).toEqual([]);
        expect(parseHistory(raw([rec('a', 10, day(1))], HISTORY_VERSION + 1))).toEqual([]);
    });

    it('drops an invalid game and keeps the others', () => {
        const good = [rec('a', 10, day(1)), rec('b', 20, day(2)), rec('c', 30, day(3))];
        const wrongTotal = { ...rec('d', 40, day(4)), score: { ...rec('d', 40, day(4)).score, total: 41 } };
        const wrongBoard = { ...rec('e', 40, day(4)), board: emptyBoard('B') };
        const tooManyCubes = { ...rec('f', 40, day(4)), cards: [{ cardId: 'fish', cubesPlaced: 5, cubesTotal: 4, points: 16 }] };
        const badDate = { ...rec('g', 40, day(4)), endedAt: 'yesterday' };
        const parsed = parseHistory(raw([good[0], wrongTotal, good[1], wrongBoard, tooManyCubes, badDate, 'x', good[2]]));
        expect(parsed).toEqual(good);
    });

    it('accepts an unknown card id', () => {
        const renamed = { ...rec('a', 10, day(1)), cards: [{ cardId: 'renamed', cubesPlaced: 1, cubesTotal: 3, points: 4 }] };
        expect(parseHistory(raw([renamed]))).toEqual([renamed]);
    });
});

describe('history storage', () => {
    it('round-trips the history', () => {
        const store = memoryStore();
        const history = [rec('a', 10, day(1)), rec('b', 20, day(2), 'B')];
        saveHistory(history, store);
        expect(loadHistory(store)).toEqual(history);
    });

    it('gives an empty history when nothing is saved', () => {
        expect(loadHistory(memoryStore())).toEqual([]);
        expect(loadHistory(undefined)).toEqual([]);
    });

    it('does not throw when the store fails', () => {
        expect(loadHistory(failingStore)).toEqual([]);
        expect(() => saveHistory([rec('a', 10, day(1))], failingStore)).not.toThrow();
    });
});
