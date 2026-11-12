import { generateBoardType } from './board';
import { ALL_ANIMAL_CARDS, ALL_SPIRIT_CARDS, SpiritCard } from './cards';
import type { BaseCard } from './cards';
import type { BoardGrid, Cell, Token } from './cell';
import { SOLO_CONFIG, seededRng, shuffle } from './config';
import { computeScoreBreakdown } from './scoring';
import type { ScoreBreakdown } from './scoring';
import { deserializeCard, restoreBoard, serializeBoard } from './storage';

// ─── State types (plain JSON, never mutated) ─────────────────────────────────

export interface CellState {
    stack:   Token[];
    hasCube: boolean;
}

// 'choosing-spirit': before turn 1, the player takes one of the offered spirits or none
export type GameStatus = 'choosing-spirit' | 'playing' | 'over';

export type Face = 'A' | 'B';

export interface CardState {
    cardId:    string;
    cubeIndex: number; // cubes left to place
}

// Everything that a turn can change, and that RESTART_TURN restores
export interface TurnData {
    board:             CellState[];        // column-major, same order as generateBoard
    tokenOffer:        (Token[] | null)[]; // null = slot taken this turn
    tokenBag:          Token[];
    tokensToPlace:     Token[];
    cardDeck:          string[];
    cardOffer:         (string | null)[]; // null = slot emptied this turn
    hand:              CardState[];        // unfinished cards
    completed:         CardState[];        // finished cards
    cardActionThisTurn: boolean;
    turn:              number;
    status:            GameStatus;
}

export interface GameState extends TurnData {
    face:        Face;
    spiritOffer: string[];      // spirits offered before turn 1, emptied once chosen
    spirit:      string | null; // spirit taken (in hand or completed), null if none
    turnStart:   TurnData;
}

export type GameAction =
    | { type: 'NEW_GAME'; seed: number; face: Face }
    | { type: 'CHOOSE_SPIRIT'; cardId: string | null }
    | { type: 'TAKE_GROUP'; index: number }
    | { type: 'PLACE_TOKEN'; tokenIndex: number; cellId: string }
    | { type: 'TAKE_CARD'; cardId: string }
    | { type: 'DISCARD_CARD'; cardId: string }
    | { type: 'PLACE_CUBE'; cardId: string; cellId: string }
    | { type: 'END_TURN' }
    | { type: 'RESTART_TURN' };

// ─── State <-> engine objects ─────────────────────────────────────────────────

export function buildGrid(face: Face, board: CellState[]): BoardGrid {
    const grid = generateBoardType(face);
    restoreBoard(grid, board);
    return grid;
}

export function boardFromGrid(grid: BoardGrid): CellState[] {
    return serializeBoard(grid);
}

export function buildCard(card: CardState): BaseCard {
    const built = deserializeCard(card);
    if (built === null) {
        throw new Error(`Unknown card: ${card.cardId}`);
    }
    return built;
}

export function cardTemplate(cardId: string): BaseCard {
    return buildCard({ cardId, cubeIndex: cubeCount(cardId) });
}

function cubeCount(cardId: string): number {
    const template = [...ALL_ANIMAL_CARDS, ...ALL_SPIRIT_CARDS].find(c => c.id === cardId);
    if (!template) {
        throw new Error(`Unknown card: ${cardId}`);
    }
    return template.points.length;
}

function snapshotOf(state: GameState): TurnData {
    // State is immutable, so sharing references is safe
    return {
        board:             state.board,
        tokenOffer:        state.tokenOffer,
        tokenBag:          state.tokenBag,
        tokensToPlace:     state.tokensToPlace,
        cardDeck:          state.cardDeck,
        cardOffer:         state.cardOffer,
        hand:              state.hand,
        completed:         state.completed,
        cardActionThisTurn: state.cardActionThisTurn,
        turn:               state.turn,
        status:             state.status,
    };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function hasTakenGroup(state: GameState): boolean {
    return state.tokenOffer.some(group => group === null);
}

export function canEndTurn(state: GameState): boolean {
    return state.status === 'playing' && hasTakenGroup(state) && state.tokensToPlace.length === 0;
}

// One card action per turn: take a card OR discard one from the offer
export function canDiscardCard(state: GameState): boolean {
    return state.status === 'playing' && !state.cardActionThisTurn;
}

export function canTakeCard(state: GameState): boolean {
    return canDiscardCard(state) && state.hand.length < SOLO_CONFIG.maxHand;
}

// Removes a card from the offer and refills it from the deck
// Empties the card's slot in the offer; it is refilled at the end of the turn
function withoutOfferCard(state: GameState, cardId: string): Pick<GameState, 'cardOffer'> {
    return { cardOffer: state.cardOffer.map(id => id === cardId ? null : id) };
}

// Fills the empty offer slots from the deck, keeping card positions
function refillCardOffer(state: GameState): Pick<GameState, 'cardOffer' | 'cardDeck'> {
    const cardDeck = [...state.cardDeck];
    const cardOffer = state.cardOffer.map(id => id ?? cardDeck.shift() ?? null);
    return { cardOffer, cardDeck };
}

export function emptyCellCount(state: GameState): number {
    return state.board.filter(c => c.stack.length === 0).length;
}

// Cell ids where the given token can be placed
export function validTokenCells(state: GameState, token: Token): Set<string> {
    const cells = buildGrid(state.face, state.board).flat();
    return new Set(cells.filter(c => c.canStack(token)).map(c => c.id));
}

// Cell ids where a cube of the given hand card can be placed
export function validCubeCells(state: GameState, cardId: string): Set<string> {
    const card = state.hand.find(c => c.cardId === cardId);
    if (!card) {
        return new Set();
    }
    const cells = buildGrid(state.face, state.board).flat();
    return new Set(buildCard(card).getValidPlacements(cells).map(c => c.id));
}

export function scoreOf(state: GameState): ScoreBreakdown {
    const cells = buildGrid(state.face, state.board).flat();
    const cards = [...state.hand, ...state.completed].map(buildCard);
    // The spirit bonus only counts once its cube is placed
    const finishedSpirit = state.completed.find(c => c.cardId === state.spirit);
    const spiritCard = finishedSpirit ? buildCard(finishedSpirit) : null;
    const spiritBonusFn = spiritCard instanceof SpiritCard ? spiritCard.scoreBonus : undefined;
    return computeScoreBreakdown(cells, cards, state.face, spiritBonusFn);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

export function newGame(seed: number, face: Face): GameState {
    const rng = seededRng(seed);
    const bagTokens = (Object.entries(SOLO_CONFIG.bag) as [Token, number][])
        .flatMap(([token, count]) => Array<Token>(count).fill(token));
    const tokenBag = shuffle(bagTokens, rng);

    const tokenOffer: Token[][] = [];
    for (let i = 0; i < SOLO_CONFIG.tokenGroups; i++) {
        tokenOffer.push(tokenBag.splice(0, SOLO_CONFIG.groupSize));
    }

    const deck = shuffle(ALL_ANIMAL_CARDS.map(c => c.id), rng);
    const cardOffer = deck.splice(0, SOLO_CONFIG.cardOffer);

    // Drawn last, so the bag and deck shuffles stay the same for a given seed
    const spiritOffer = shuffle(ALL_SPIRIT_CARDS.map(c => c.id), rng).slice(0, SOLO_CONFIG.spiritOffer);

    const turnData: TurnData = {
        board:             boardFromGrid(generateBoardType(face)),
        tokenOffer,
        tokenBag,
        tokensToPlace:     [],
        cardDeck:          deck,
        cardOffer,
        hand:              [],
        completed:         [],
        cardActionThisTurn: false,
        turn:              1,
        status:            'choosing-spirit',
    };
    return { ...turnData, face, spiritOffer, spirit: null, turnStart: turnData };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

// Invalid actions return the state unchanged
export function gameReducer(state: GameState, action: GameAction): GameState {
    if (action.type === 'NEW_GAME') {
        return newGame(action.seed, action.face);
    }
    if (action.type === 'CHOOSE_SPIRIT') {
        return chooseSpirit(state, action.cardId);
    }
    if (state.status !== 'playing') {
        return state;
    }

    switch (action.type) {
        case 'TAKE_GROUP': {
            const group = state.tokenOffer[action.index];
            if (hasTakenGroup(state) || !group) {
                return state;
            }
            const tokenOffer = state.tokenOffer.map((g, i) => i === action.index ? null : g);
            return { ...state, tokenOffer, tokensToPlace: [...group] };
        }

        case 'PLACE_TOKEN': {
            const token = state.tokensToPlace[action.tokenIndex];
            if (token === undefined) {
                return state;
            }
            const grid = buildGrid(state.face, state.board);
            const cell = findCell(grid, action.cellId);
            if (!cell || !cell.canStack(token)) {
                return state;
            }
            cell.stack.push(token);
            return {
                ...state,
                board:         boardFromGrid(grid),
                tokensToPlace: state.tokensToPlace.filter((_, i) => i !== action.tokenIndex),
            };
        }

        case 'TAKE_CARD': {
            if (!canTakeCard(state) || !state.cardOffer.includes(action.cardId)) {
                return state;
            }
            return {
                ...state,
                ...withoutOfferCard(state, action.cardId),
                hand:               [...state.hand, { cardId: action.cardId, cubeIndex: cubeCount(action.cardId) }],
                cardActionThisTurn: true,
            };
        }

        case 'DISCARD_CARD': {
            if (!canDiscardCard(state) || !state.cardOffer.includes(action.cardId)) {
                return state;
            }
            // The discarded card leaves the game
            return {
                ...state,
                ...withoutOfferCard(state, action.cardId),
                cardActionThisTurn: true,
            };
        }

        case 'PLACE_CUBE': {
            const handCard = state.hand.find(c => c.cardId === action.cardId);
            if (!handCard) {
                return state;
            }
            const grid = buildGrid(state.face, state.board);
            const card = buildCard(handCard);
            const target = card.getValidPlacements(grid.flat()).find(c => c.id === action.cellId);
            if (!target) {
                return state;
            }
            card.place(target);
            const updated: CardState = { cardId: card.id, cubeIndex: card.cubeIndex };
            const finished = updated.cubeIndex === 0;
            return {
                ...state,
                board:     boardFromGrid(grid),
                hand:      finished
                    ? state.hand.filter(c => c.cardId !== action.cardId)
                    : state.hand.map(c => c.cardId === action.cardId ? updated : c),
                completed: finished ? [...state.completed, updated] : state.completed,
            };
        }

        case 'END_TURN': {
            if (!canEndTurn(state)) {
                return state;
            }
            const gameOver = emptyCellCount(state) <= SOLO_CONFIG.endEmptyCells
                || state.tokenBag.length < SOLO_CONFIG.tokenGroups * SOLO_CONFIG.groupSize;
            if (gameOver) {
                return { ...state, status: 'over' };
            }
            // Groups not taken this turn are discarded: the whole offer is redrawn
            const tokenBag = [...state.tokenBag];
            const tokenOffer = state.tokenOffer.map(() => tokenBag.splice(0, SOLO_CONFIG.groupSize));
            const next: GameState = {
                ...state,
                ...refillCardOffer(state),
                tokenOffer,
                tokenBag,
                cardActionThisTurn: false,
                turn:              state.turn + 1,
            };
            return { ...next, turnStart: snapshotOf(next) };
        }

        case 'RESTART_TURN':
            return { ...state, ...state.turnStart };
    }
}

// The choice is final: the new turn snapshot is taken after it, so RESTART_TURN keeps it
function chooseSpirit(state: GameState, cardId: string | null): GameState {
    if (state.status !== 'choosing-spirit' || (cardId !== null && !state.spiritOffer.includes(cardId))) {
        return state;
    }
    const next: GameState = {
        ...state,
        hand:        cardId === null ? state.hand : [...state.hand, { cardId, cubeIndex: cubeCount(cardId) }],
        spiritOffer: [],
        spirit:      cardId,
        status:      'playing',
    };
    return { ...next, turnStart: snapshotOf(next) };
}

function findCell(grid: BoardGrid, cellId: string): Cell | undefined {
    return grid.flat().find(c => c.id === cellId);
}
