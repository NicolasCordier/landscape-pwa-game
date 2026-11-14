import type { Token } from './cell';
import type { BoardGrid } from './cell';
import { generateBoardType } from './board';
import { AnimalCard, SpiritCard, ALL_ANIMAL_CARDS, ALL_SPIRIT_CARDS } from './cards';
import type { BaseCard } from './cards';
import type { GameState } from './state';

// ─── Serializable snapshot types ─────────────────────────────────────────────

// Lightweight serializable card state (excludes functions and pattern data)
interface SerializedCard {
    cardId: string;
    cubeIndex: number;
}

// Lightweight serializable board cell state (excludes neighbor refs)
interface SerializedCell {
    stack: Token[];
    hasCube: boolean;
}

export interface GameRecord {
    id: string;
    date: string;
    score: number;
    face: 'A' | 'B';
    scoreBreakdown: {
        trees: number;
        mountains: number;
        fields: number;
        buildings: number;
        river: number;
        animals: number;
        spirit: number;
    };
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
    currentGame: 'landscape_current_game',
    history:     'landscape_history',
} as const;

// ─── Board serialization ──────────────────────────────────────────────────────

// Serializes board cells to a flat column-major array
export function serializeBoard(grid: BoardGrid): SerializedCell[] {
    const result: SerializedCell[] = [];
    for (const col of grid) {
        for (const cell of col) {
            result.push({ stack: [...cell.stack], hasCube: cell.hasCube });
        }
    }
    return result;
}

// Applies serialized cell state to a freshly generated board (matched by column-major position)
export function restoreBoard(grid: BoardGrid, saved: SerializedCell[]): void {
    let idx = 0;
    for (const col of grid) {
        for (const cell of col) {
            const s = saved[idx++];
            if (s !== undefined) {
                cell.stack = [...s.stack];
                cell.hasCube = s.hasCube;
            }
        }
    }
}

// ─── Card serialization ───────────────────────────────────────────────────────

// Looks up a card template from the registry and clones it with the saved cubeIndex
export function deserializeCard(saved: SerializedCard): BaseCard | null {
    const template =
        ALL_ANIMAL_CARDS.find(c => c.id === saved.cardId) ??
        ALL_SPIRIT_CARDS.find(c => c.id === saved.cardId) ??
        null;

    if (template === null) {
        return null;
    }

    if (template instanceof SpiritCard) {
        const clone = new SpiritCard(
            template.id,
            template.centerTerrain,
            template.pattern,
            template.cubeAt,
            template.scoreBonus
        );
        clone.cubeIndex = saved.cubeIndex;
        return clone;
    }

    const clone = new AnimalCard(
        template.id,
        template.centerTerrain,
        template.pattern,
        template.cubeAt,
        template.points
    );
    clone.cubeIndex = saved.cubeIndex;
    return clone;
}

// ─── Current game ─────────────────────────────────────────────────────────────

// Bump whenever a GameState change makes older saves unusable: a field added
// without a default, a field whose meaning changes, or renamed card ids.
// Version 1 was an older format that was never written.
export const SAVE_VERSION = 2;

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function defaultStore(): KeyValueStore | undefined {
    try {
        return globalThis.localStorage;
    } catch {
        return undefined; // storage blocked (private mode, disabled site data)
    }
}

const KNOWN_CARD_IDS = new Set([...ALL_ANIMAL_CARDS, ...ALL_SPIRIT_CARDS].map(c => c.id));
const TOKENS = new Set<unknown>(['GREEN', 'GRAY', 'BROWN', 'YELLOW', 'BLUE', 'RED'] satisfies Token[]);

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArrayOf<T>(value: unknown, check: (item: unknown) => item is T): value is T[] {
    return Array.isArray(value) && value.every(check);
}

const isToken = (v: unknown): v is Token => TOKENS.has(v);
const isCardId = (v: unknown): v is string => typeof v === 'string' && KNOWN_CARD_IDS.has(v);
const isTokenGroup = (v: unknown): v is Token[] | null => v === null || isArrayOf(v, isToken);
const isOfferSlot = (v: unknown): v is string | null => v === null || isCardId(v);
const isCardState = (v: unknown): v is SerializedCard =>
    isObject(v) && isCardId(v.cardId) && typeof v.cubeIndex === 'number';
const isCell = (v: unknown): v is SerializedCell =>
    isObject(v) && isArrayOf(v.stack, isToken) && typeof v.hasCube === 'boolean';

// Structural check of the data a turn can change
function isTurnData(value: unknown, cellCount: number): boolean {
    return isObject(value)
        && isArrayOf(value.board, isCell) && value.board.length === cellCount
        && isArrayOf(value.tokenOffer, isTokenGroup)
        && isArrayOf(value.tokenBag, isToken)
        && isArrayOf(value.tokensToPlace, isToken)
        && isArrayOf(value.cardDeck, isCardId)
        && isArrayOf(value.cardOffer, isOfferSlot)
        && isArrayOf(value.hand, isCardState)
        && isArrayOf(value.completed, isCardState)
        && typeof value.cardActionThisTurn === 'boolean'
        && typeof value.turn === 'number'
        && (value.status === 'choosing-spirit' || value.status === 'playing');
}

// Returns the saved game, or null if it is unreadable, from another version, or finished.
// Structural only: the game rules are not replayed.
export function parseSavedGame(raw: string): GameState | null {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!isObject(parsed) || parsed.version !== SAVE_VERSION || !isObject(parsed.state)) {
            return null;
        }
        const state = parsed.state;
        if (state.face !== 'A' && state.face !== 'B') {
            return null;
        }
        const cellCount = generateBoardType(state.face).flat().length;
        const valid = isTurnData(state, cellCount)
            && isTurnData(state.turnStart, cellCount)
            && isArrayOf(state.spiritOffer, isCardId)
            && (state.spirit === null || isCardId(state.spirit));
        return valid ? state as unknown as GameState : null;
    } catch {
        return null;
    }
}

// Never throws: a full or blocked storage just leaves the game unsaved
export function saveCurrentGame(state: GameState, store: KeyValueStore | undefined = defaultStore()): void {
    try {
        store?.setItem(STORAGE_KEYS.currentGame, JSON.stringify({ version: SAVE_VERSION, state }));
    } catch {
        // Not saved: the game goes on, but will not survive closing the app
    }
}

// Never throws. A save that cannot be resumed is removed so it is not checked again.
export function loadCurrentGame(store: KeyValueStore | undefined = defaultStore()): GameState | null {
    try {
        const raw = store?.getItem(STORAGE_KEYS.currentGame);
        if (raw === null || raw === undefined) {
            return null;
        }
        const state = parseSavedGame(raw);
        if (state === null) {
            store?.removeItem(STORAGE_KEYS.currentGame);
        }
        return state;
    } catch {
        return null;
    }
}

export function clearCurrentGame(store: KeyValueStore | undefined = defaultStore()): void {
    try {
        store?.removeItem(STORAGE_KEYS.currentGame);
    } catch {
        // Nothing else to do: a save that cannot be removed cannot be read either
    }
}

// ─── History ──────────────────────────────────────────────────────────────────

export function saveGameRecord(record: GameRecord): void {
    const history = loadHistory();
    history.push(record);
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

export function loadHistory(): GameRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    if (raw === null) {
        return [];
    }
    try {
        return JSON.parse(raw) as GameRecord[];
    } catch {
        return [];
    }
}
