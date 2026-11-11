import { describe, expect, it } from 'vitest';
import { seededRng, shuffle } from './config';
import {
    boardFromGrid, buildGrid, gameReducer, newGame, validCubeCells,
} from './state';
import type { CellState, GameAction, GameState } from './state';

function run(state: GameState, ...actions: GameAction[]): GameState {
    return actions.reduce(gameReducer, state);
}

// Places the 3 tokens of the taken group on the first empty cells
function placeAllTokens(state: GameState): GameState {
    let s = state;
    while (s.tokensToPlace.length > 0) {
        const emptyIdx = s.board.findIndex(c => c.stack.length === 0);
        const grid = buildGrid(s.face, s.board);
        s = gameReducer(s, { type: 'PLACE_TOKEN', tokenIndex: 0, cellId: grid.flat()[emptyIdx].id });
    }
    return s;
}

function withBoard(state: GameState, edit: (board: CellState[]) => void): GameState {
    const board = state.board.map(c => ({ stack: [...c.stack], hasCube: c.hasCube }));
    edit(board);
    return { ...state, board };
}

describe('shuffle', () => {
    it('gives the same order for the same seed', () => {
        const items = Array.from({ length: 20 }, (_, i) => i);
        expect(shuffle(items, seededRng(42))).toEqual(shuffle(items, seededRng(42)));
        expect(shuffle(items, seededRng(42))).not.toEqual(items);
    });
});

describe('state <-> engine objects', () => {
    it('round-trips the board unchanged', () => {
        const state = withBoard(newGame(1), b => {
            b[0].stack = ['BROWN', 'GREEN'];
            b[3].stack = ['GRAY'];
            b[3].hasCube = true;
        });
        expect(boardFromGrid(buildGrid(state.face, state.board))).toEqual(state.board);
    });
});

describe('NEW_GAME', () => {
    it('sets up an empty board and full offers', () => {
        const s = newGame(7);
        expect(s.board.every(c => c.stack.length === 0 && !c.hasCube)).toBe(true);
        expect(s.tokenOffer).toHaveLength(3);
        expect(s.tokenOffer.every(g => g?.length === 3)).toBe(true);
        expect(s.cardOffer).toHaveLength(3);
        expect(s.hand).toEqual([]);
        expect(s.tokenBag).toHaveLength(111);
        expect(s.turn).toBe(1);
    });

    it('uses the official bag composition (offer + bag)', () => {
        const s = newGame(11);
        const all = [...s.tokenOffer.flatMap(g => g ?? []), ...s.tokenBag];
        const count = (t: string) => all.filter(x => x === t).length;
        expect({
            BLUE: count('BLUE'), GRAY: count('GRAY'), BROWN: count('BROWN'),
            GREEN: count('GREEN'), YELLOW: count('YELLOW'), RED: count('RED'),
        }).toEqual({ BLUE: 23, GRAY: 23, BROWN: 21, GREEN: 19, YELLOW: 19, RED: 15 });
    });
});

describe('TAKE_GROUP and PLACE_TOKEN', () => {
    it('allows only one group per turn', () => {
        const s = run(newGame(1), { type: 'TAKE_GROUP', index: 0 });
        expect(s.tokensToPlace).toHaveLength(3);
        expect(s.tokenOffer[0]).toBeNull();
        expect(gameReducer(s, { type: 'TAKE_GROUP', index: 1 })).toBe(s);
    });

    it('places a token on an allowed cell', () => {
        const s = run(newGame(1), { type: 'TAKE_GROUP', index: 0 });
        const token = s.tokensToPlace[0];
        const next = gameReducer(s, { type: 'PLACE_TOKEN', tokenIndex: 0, cellId: '0-0' });
        expect(next.board[0].stack).toEqual([token]);
        expect(next.tokensToPlace).toHaveLength(2);
    });

    it('refuses a token on a forbidden cell', () => {
        let s = run(newGame(1), { type: 'TAKE_GROUP', index: 0 });
        s = { ...s, tokensToPlace: ['BLUE', 'BLUE', 'BLUE'] };
        s = withBoard(s, b => { b[0].stack = ['YELLOW']; });
        expect(gameReducer(s, { type: 'PLACE_TOKEN', tokenIndex: 0, cellId: '0-0' })).toBe(s);
    });

    it('refuses a token on a cell with a cube', () => {
        let s = run(newGame(1), { type: 'TAKE_GROUP', index: 0 });
        s = { ...s, tokensToPlace: ['GREEN', 'GREEN', 'GREEN'] };
        s = withBoard(s, b => { b[0].stack = ['BROWN']; b[0].hasCube = true; });
        expect(gameReducer(s, { type: 'PLACE_TOKEN', tokenIndex: 0, cellId: '0-0' })).toBe(s);
    });
});

// Id of the card in the given offer slot (fails the test if the slot is empty)
function offered(s: GameState, slot: number): string {
    const id = s.cardOffer[slot];
    if (id === null) {
        throw new Error(`Offer slot ${slot} is empty`);
    }
    return id;
}

// Takes the 3 tokens of group 0, places them and ends the turn
function finishTurn(s: GameState): GameState {
    return gameReducer(placeAllTokens(gameReducer(s, { type: 'TAKE_GROUP', index: 0 })), { type: 'END_TURN' });
}

const FULL_HAND = ['bear', 'wolf', 'duck', 'frog'].map(cardId => ({ cardId, cubeIndex: 1 }));

describe('TAKE_CARD', () => {
    it('moves the card to the hand and leaves its slot empty until the end of the turn', () => {
        const s = newGame(3);
        const taken = offered(s, 1);
        const next = gameReducer(s, { type: 'TAKE_CARD', cardId: taken });
        expect(next.hand.map(c => c.cardId)).toEqual([taken]);
        expect(next.cardOffer).toEqual([s.cardOffer[0], null, s.cardOffer[2]]);
        expect(next.cardDeck).toEqual(s.cardDeck);
    });

    it('refuses a card when the hand is full', () => {
        const s: GameState = { ...newGame(3), hand: FULL_HAND };
        expect(gameReducer(s, { type: 'TAKE_CARD', cardId: offered(s, 0) })).toBe(s);
    });

    it('refuses a second card in the same turn', () => {
        const start = newGame(3);
        const s = gameReducer(start, { type: 'TAKE_CARD', cardId: offered(start, 0) });
        expect(gameReducer(s, { type: 'TAKE_CARD', cardId: offered(s, 1) })).toBe(s);
    });
});

describe('DISCARD_CARD', () => {
    it('removes the card from the offer without adding it to the hand', () => {
        const s = newGame(3);
        const discarded = offered(s, 0);
        const next = gameReducer(s, { type: 'DISCARD_CARD', cardId: discarded });
        expect(next.hand).toEqual([]);
        expect(next.cardOffer).toEqual([null, s.cardOffer[1], s.cardOffer[2]]);
        expect(next.cardDeck).toEqual(s.cardDeck);
    });

    it('is allowed when the hand is full', () => {
        const s: GameState = { ...newGame(3), hand: FULL_HAND };
        const next = gameReducer(s, { type: 'DISCARD_CARD', cardId: offered(s, 0) });
        expect(next.cardOffer[0]).toBeNull();
    });

    it('shares the single card action of the turn with TAKE_CARD', () => {
        const start = newGame(3);
        const afterDiscard = gameReducer(start, { type: 'DISCARD_CARD', cardId: offered(start, 0) });
        expect(gameReducer(afterDiscard, { type: 'TAKE_CARD', cardId: offered(afterDiscard, 1) })).toBe(afterDiscard);
        expect(gameReducer(afterDiscard, { type: 'DISCARD_CARD', cardId: offered(afterDiscard, 1) })).toBe(afterDiscard);

        const afterTake = gameReducer(start, { type: 'TAKE_CARD', cardId: offered(start, 0) });
        expect(gameReducer(afterTake, { type: 'DISCARD_CARD', cardId: offered(afterTake, 1) })).toBe(afterTake);
    });
});

describe('card offer refill', () => {
    it('refills the emptied slot from the deck only at the end of the turn', () => {
        const start = newGame(3);
        const afterTake = gameReducer(start, { type: 'TAKE_CARD', cardId: offered(start, 1) });
        const next = finishTurn(afterTake);
        expect(next.cardOffer).toEqual([start.cardOffer[0], start.cardDeck[0], start.cardOffer[2]]);
        expect(next.cardDeck).toEqual(start.cardDeck.slice(1));
    });

    it('refills after a discard too, and allows a new card action', () => {
        const start = newGame(3);
        const next = finishTurn(gameReducer(start, { type: 'DISCARD_CARD', cardId: offered(start, 2) }));
        expect(next.cardOffer[2]).toBe(start.cardDeck[0]);
        expect(next.cardActionThisTurn).toBe(false);
    });

    it('keeps the slot empty when the deck is empty', () => {
        const start: GameState = { ...newGame(3), cardDeck: [] };
        const next = finishTurn(gameReducer(start, { type: 'TAKE_CARD', cardId: offered(start, 0) }));
        expect(next.cardOffer[0]).toBeNull();
    });
});

describe('PLACE_CUBE', () => {
    // condor: center MTN_3, one FIELD neighbor, cube on center, points [11, 5]
    function condorBoard(): GameState {
        const s: GameState = { ...newGame(5), hand: [{ cardId: 'condor', cubeIndex: 2 }] };
        return withBoard(s, b => {
            // cell 0-0 (index 0) and its neighbor 0-1 (index 1)
            b[0].stack = ['GRAY', 'GRAY', 'GRAY'];
            b[1].stack = ['YELLOW'];
        });
    }

    it('places a cube on a valid cell', () => {
        const s = condorBoard();
        expect(validCubeCells(s, 'condor')).toEqual(new Set(['0-0']));
        const next = gameReducer(s, { type: 'PLACE_CUBE', cardId: 'condor', cellId: '0-0' });
        expect(next.board[0].hasCube).toBe(true);
        expect(next.hand).toEqual([{ cardId: 'condor', cubeIndex: 1 }]);
    });

    it('refuses a cube on an invalid cell', () => {
        const s = condorBoard();
        expect(gameReducer(s, { type: 'PLACE_CUBE', cardId: 'condor', cellId: '0-1' })).toBe(s);
    });

    it('moves a finished card to the completed pile', () => {
        const s = { ...condorBoard(), hand: [{ cardId: 'condor', cubeIndex: 1 }] };
        const next = gameReducer(s, { type: 'PLACE_CUBE', cardId: 'condor', cellId: '0-0' });
        expect(next.hand).toEqual([]);
        expect(next.completed).toEqual([{ cardId: 'condor', cubeIndex: 0 }]);
    });
});

describe('END_TURN', () => {
    it('is refused while tokens remain', () => {
        const s = run(newGame(1), { type: 'TAKE_GROUP', index: 1 });
        expect(gameReducer(s, { type: 'END_TURN' })).toBe(s);
        expect(gameReducer(newGame(1), { type: 'END_TURN' }).turn).toBe(1);
    });

    it('refills only the taken slot', () => {
        const start = newGame(1);
        const s = placeAllTokens(run(start, { type: 'TAKE_GROUP', index: 1 }));
        const next = gameReducer(s, { type: 'END_TURN' });
        expect(next.turn).toBe(2);
        expect(next.status).toBe('playing');
        expect(next.tokenOffer[0]).toEqual(start.tokenOffer[0]);
        expect(next.tokenOffer[2]).toEqual(start.tokenOffer[2]);
        expect(next.tokenOffer[1]).toEqual(start.tokenBag.slice(0, 3));
        expect(next.tokenBag).toHaveLength(108);
        expect(next.turnStart.turn).toBe(2);
    });

    it('ends the game when 2 cells or fewer are empty', () => {
        let s = run(newGame(1), { type: 'TAKE_GROUP', index: 0 });
        s = withBoard(s, b => { b.slice(5).forEach(c => { c.stack = ['YELLOW']; }); });
        s = placeAllTokens(s); // fills 3 of the 5 remaining empty cells
        expect(gameReducer(s, { type: 'END_TURN' }).status).toBe('over');
    });

    it('ends the game when the bag holds fewer than 3 tokens', () => {
        let s = run(newGame(1), { type: 'TAKE_GROUP', index: 0 });
        s = placeAllTokens({ ...s, tokenBag: ['RED', 'RED'] });
        expect(gameReducer(s, { type: 'END_TURN' }).status).toBe('over');
    });
});

describe('RESTART_TURN', () => {
    it('restores the exact state of the turn start', () => {
        const start = newGame(9);
        let s = run(start, { type: 'TAKE_GROUP', index: 2 }, { type: 'TAKE_CARD', cardId: offered(start, 1) });
        s = placeAllTokens(s);
        expect(gameReducer(s, { type: 'RESTART_TURN' })).toEqual(start);
    });
});
