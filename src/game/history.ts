import { generateBoardType } from './board';
import { ALL_SPIRIT_CARDS } from './cards';
import type { ScoreBreakdown } from './scoring';
import { buildCard, cardTemplate, scoreOf } from './state';
import type { CellState, Face, GameState } from './state';
import { defaultStore, isArrayOf, isCell, isObject } from './storage';
import type { KeyValueStore } from './storage';

// ─── Record of a finished game ────────────────────────────────────────────────

// An animal card taken during the game, finished or still in hand
export interface CardRecord {
    cardId:      string;
    cubesPlaced: number;
    cubesTotal:  number;
    points:      number;
}

export interface SpiritRecord {
    cardId:     string;
    cubePlaced: boolean;
    points:     number; // the spirit category of the score
}

// Values that could be derived (points, cubesTotal, score) are stored as they were:
// a later change to the rules or the cards must not rewrite past games.
export interface GameRecord {
    id:      string;
    endedAt: string; // ISO 8601
    face:    Face;
    turns:   number;
    score:   ScoreBreakdown;
    board:   CellState[];
    cards:   CardRecord[];
    spirit:  SpiritRecord | null;
}

export type History = GameRecord[];

const SPIRIT_IDS = new Set(ALL_SPIRIT_CARDS.map(c => c.id));

export function recordOf(state: GameState, endedAt: string): GameRecord {
    const score = scoreOf(state);
    const taken = [...state.completed, ...state.hand];

    const cards = taken
        .filter(c => !SPIRIT_IDS.has(c.cardId))
        .map(c => {
            const cubesTotal = cardTemplate(c.cardId).cubeIndex;
            return {
                cardId:      c.cardId,
                cubesPlaced: cubesTotal - c.cubeIndex,
                cubesTotal,
                points:      buildCard(c).getScore(),
            };
        });

    const spirit = state.spirit === null ? null : {
        cardId:     state.spirit,
        cubePlaced: state.completed.some(c => c.cardId === state.spirit),
        points:     score.spirit,
    };

    return {
        id:      state.id,
        endedAt,
        face:    state.face,
        turns:   state.turn,
        score,
        board:   state.board,
        cards,
        spirit,
    };
}

// A game already recorded is not added again (StrictMode effects, score screen shown twice)
export function addRecord(history: History, record: GameRecord): History {
    return history.some(r => r.id === record.id) ? history : [...history, record];
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const LEADERBOARD_SIZE = 10;

// Highest total first; on a tie, the older game comes first
function compareRecords(a: GameRecord, b: GameRecord): number {
    return b.score.total - a.score.total || a.endedAt.localeCompare(b.endedAt);
}

export function leaderboard(history: History, face: Face, limit = LEADERBOARD_SIZE): GameRecord[] {
    return history.filter(r => r.face === face).sort(compareRecords).slice(0, limit);
}

export interface Placement {
    rank:     number; // 1-based, in the leaderboard of the game's face
    isRecord: boolean;
}

// Where a game stands in the leaderboard of its face, or null when outside it
export function placement(history: History, id: string): Placement | null {
    const record = history.find(r => r.id === id);
    if (!record) {
        return null;
    }
    const index = leaderboard(history, record.face).findIndex(r => r.id === id);
    if (index === -1) {
        return null;
    }
    const others = history.filter(r => r.face === record.face && r.id !== id);
    const isRecord = others.every(r => record.score.total > r.score.total);
    return { rank: index + 1, isRecord };
}

// Newest first
export function byDate(history: History): GameRecord[] {
    return [...history].sort((a, b) => b.endedAt.localeCompare(a.endedAt));
}

// ─── Storage ──────────────────────────────────────────────────────────────────

// Bump when the record format changes, and convert older records rather than drop them:
// unlike a game in progress, the history is worth keeping.
export const HISTORY_VERSION = 1;
const HISTORY_KEY = 'landscape_history';

const SCORE_KEYS = ['trees', 'mountains', 'fields', 'buildings', 'river', 'animals', 'spirit'] as const;

const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

function isScore(v: unknown): v is ScoreBreakdown {
    return isObject(v)
        && SCORE_KEYS.every(k => isInt(v[k]))
        && isInt(v.total)
        && SCORE_KEYS.reduce((sum, k) => sum + (v[k] as number), 0) === v.total;
}

// Card ids are not checked against the card list: a renamed card must not erase past games
const isCardRecord = (v: unknown): v is CardRecord =>
    isObject(v) && typeof v.cardId === 'string'
    && isCount(v.cubesTotal) && isCount(v.cubesPlaced) && v.cubesPlaced <= v.cubesTotal
    && isInt(v.points);

const isSpiritRecord = (v: unknown): v is SpiritRecord | null =>
    v === null || (isObject(v) && typeof v.cardId === 'string'
        && typeof v.cubePlaced === 'boolean' && isInt(v.points));

const CELL_COUNT: Record<Face, number> = {
    A: generateBoardType('A').flat().length,
    B: generateBoardType('B').flat().length,
};

function isRecord(v: unknown): v is GameRecord {
    return isObject(v)
        && typeof v.id === 'string'
        && typeof v.endedAt === 'string' && !Number.isNaN(Date.parse(v.endedAt))
        && (v.face === 'A' || v.face === 'B')
        && isCount(v.turns)
        && isScore(v.score)
        && isArrayOf(v.board, isCell) && v.board.length === CELL_COUNT[v.face]
        && isArrayOf(v.cards, isCardRecord)
        && isSpiritRecord(v.spirit);
}

// Never throws. Unreadable data gives an empty history; an invalid game is dropped alone.
export function parseHistory(raw: string): History {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!isObject(parsed) || parsed.version !== HISTORY_VERSION || !Array.isArray(parsed.records)) {
            return [];
        }
        return parsed.records.filter(isRecord);
    } catch {
        return [];
    }
}

export function loadHistory(store: KeyValueStore | undefined = defaultStore()): History {
    try {
        const raw = store?.getItem(HISTORY_KEY);
        return raw === null || raw === undefined ? [] : parseHistory(raw);
    } catch {
        return [];
    }
}

// Never throws: when storage is blocked, the history only lives until the app closes
export function saveHistory(history: History, store: KeyValueStore | undefined = defaultStore()): void {
    try {
        store?.setItem(HISTORY_KEY, JSON.stringify({ version: HISTORY_VERSION, records: history }));
    } catch {
        // Not saved
    }
}
