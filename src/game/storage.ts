import type { Token } from './cell';
import type { BoardGrid } from './cell';
import { generateBoardType } from './board';
import { AnimalCard, SpiritCard, ALL_ANIMAL_CARDS, ALL_SPIRIT_CARDS } from './cards';
import type { BaseCard } from './cards';

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

// Turn snapshot stored at the start of each turn for rollback
// Mirrors SavedGame but without a nested snapshot (one level only)
export interface TurnSnapshot {
    board: SerializedCell[];
    hand: SerializedCard[];
    spiritCard: SerializedCard | null;
    centralBoard: Token[][];
    tokenBag: Token[];
    turn: number;
}

export interface SavedGame {
    version: number;
    face: 'A' | 'B';
    board: SerializedCell[];       // flat column-major order (same as generateBoard iteration)
    hand: SerializedCard[];
    spiritCard: SerializedCard | null;
    centralBoard: Token[][];       // 3 groups of 3 tokens (solo central board)
    tokenBag: Token[];
    turn: number;
    turnSnapshot: TurnSnapshot | null; // snapshot at turn start; null at game start
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

const CURRENT_VERSION = 1;

// ─── Board serialization ──────────────────────────────────────────────────────

// Serializes board cells to a flat column-major array
function serializeBoard(grid: BoardGrid): SerializedCell[] {
    const result: SerializedCell[] = [];
    for (const col of grid) {
        for (const cell of col) {
            result.push({ stack: [...cell.stack], hasCube: cell.hasCube });
        }
    }
    return result;
}

// Applies serialized cell state to a freshly generated board (matched by column-major position)
function restoreBoard(grid: BoardGrid, saved: SerializedCell[]): void {
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

export function serializeCard(card: BaseCard): SerializedCard {
    return { cardId: card.id, cubeIndex: card.cubeIndex };
}

// Looks up a card template from the registry and clones it with the saved cubeIndex
function deserializeCard(saved: SerializedCard): BaseCard | null {
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

// ─── Snapshot helpers ─────────────────────────────────────────────────────────

export function createTurnSnapshot(game: SavedGame): TurnSnapshot {
    return {
        board:        game.board.map(c => ({ stack: [...c.stack], hasCube: c.hasCube })),
        hand:         game.hand.map(c => ({ ...c })),
        spiritCard:   game.spiritCard ? { ...game.spiritCard } : null,
        centralBoard: game.centralBoard.map(group => [...group]),
        tokenBag:     [...game.tokenBag],
        turn:         game.turn,
    };
}

// Reverts a SavedGame to a previously captured snapshot
export function applyTurnSnapshot(game: SavedGame, snapshot: TurnSnapshot): SavedGame {
    return {
        ...game,
        board:        snapshot.board.map(c => ({ stack: [...c.stack], hasCube: c.hasCube })),
        hand:         snapshot.hand.map(c => ({ ...c })),
        spiritCard:   snapshot.spiritCard ? { ...snapshot.spiritCard } : null,
        centralBoard: snapshot.centralBoard.map(group => [...group]),
        tokenBag:     [...snapshot.tokenBag],
        turn:         snapshot.turn,
        turnSnapshot: null,
    };
}

// ─── Game deserialization ─────────────────────────────────────────────────────

export interface DeserializedGame {
    grid: BoardGrid;
    hand: BaseCard[];
    spiritCard: SpiritCard | null;
    centralBoard: Token[][];
    tokenBag: Token[];
    turn: number;
    face: 'A' | 'B';
}

export function deserializeGame(saved: SavedGame): DeserializedGame {
    const grid = generateBoardType(saved.face);
    restoreBoard(grid, saved.board);

    const hand = saved.hand
        .map(deserializeCard)
        .filter((c): c is BaseCard => c !== null);

    const spiritCardRaw = saved.spiritCard ? deserializeCard(saved.spiritCard) : null;
    const spiritCard = spiritCardRaw instanceof SpiritCard ? spiritCardRaw : null;

    return {
        grid,
        hand,
        spiritCard,
        centralBoard: saved.centralBoard.map(group => [...group]),
        tokenBag:     [...saved.tokenBag],
        turn:         saved.turn,
        face:         saved.face,
    };
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

export function buildInitialSavedGame(face: 'A' | 'B', tokenBag: Token[]): SavedGame {
    const grid = generateBoardType(face);
    return {
        version:      CURRENT_VERSION,
        face,
        board:        serializeBoard(grid),
        hand:         [],
        spiritCard:   null,
        centralBoard: [],
        tokenBag:     [...tokenBag],
        turn:         1,
        turnSnapshot: null,
    };
}

export function saveCurrentGame(game: SavedGame): void {
    localStorage.setItem(STORAGE_KEYS.currentGame, JSON.stringify(game));
}

export function loadCurrentGame(): SavedGame | null {
    const raw = localStorage.getItem(STORAGE_KEYS.currentGame);
    if (raw === null) {
        return null;
    }
    try {
        const parsed = JSON.parse(raw) as SavedGame;
        if (parsed.version !== CURRENT_VERSION) {
            return null; // incompatible save version — discard
        }
        return parsed;
    } catch {
        return null;
    }
}

export function clearCurrentGame(): void {
    localStorage.removeItem(STORAGE_KEYS.currentGame);
}

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
