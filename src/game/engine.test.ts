import { describe, expect, it } from 'vitest';
import { generateBoard } from './board';
import { ALL_ANIMAL_CARDS, ALL_SPIRIT_CARDS, AnimalCard, SpiritCard } from './cards';
import type { Token } from './cell';
import { computeScoreBreakdown } from './scoring';

function cellIds(cols: number, rows: number): string[] {
    return generateBoard(cols, rows).flat().map(c => c.id);
}

describe('board', () => {
    it('gives the same position-based ids to two generated boards', () => {
        expect(cellIds(5, 5)).toEqual(cellIds(5, 5));
        expect(generateBoard(5, 5)[2][3].id).toBe('2-3');
    });
});

describe('cube on a neighbor (cubeAt "0")', () => {
    // crocodile: center RIVER, pattern[0] = RIVER (cube), pattern[3] = TREE_3
    const template = ALL_ANIMAL_CARDS.find(c => c.id === 'crocodile')!;

    for (let rot = 0; rot < 6; rot++) {
        it(`targets the right cell for rotation ${rot}`, () => {
            const card = new AnimalCard(template.id, template.centerTerrain, template.pattern, template.cubeAt, [...template.points]);
            const grid = generateBoard(5, 5);
            const center = grid[1][1]; // odd column, all 6 neighbors exist
            const cubeSlot = (6 - rot) % 6;
            const opposite = (cubeSlot + 3) % 6;
            center.stack = ['BLUE'];
            center.neighbors[cubeSlot]!.stack = ['BLUE'];
            center.neighbors[opposite]!.stack = ['BROWN', 'BROWN', 'GREEN'];

            const placement = card.canPlace(center);
            expect(placement).not.toBeNull();
            expect(placement!.cubeCell.id).toBe(center.neighbors[cubeSlot]!.id);
        });
    }
});

describe('houses', () => {
    it('counts a house only once it has two levels', () => {
        const cell = generateBoard(5, 5)[0][0];
        cell.stack = ['RED'];
        expect(cell.detectTerrain()).toBeNull();
        cell.stack = ['BROWN', 'RED'];
        expect(cell.detectTerrain()).toBe('CITY');
    });

    // phoenix: center CITY, pattern[0] = CITY (cube), pattern[3] = FIELD
    const template = ALL_SPIRIT_CARDS.find(c => c.id === 'phoenix')!;
    const setup = (cubeHouse: Token[]) => {
        const card = new SpiritCard(template.id, template.centerTerrain, template.pattern, template.cubeAt, template.scoreBonus);
        const center = generateBoard(5, 5)[1][1];
        center.stack = ['BROWN', 'RED'];
        center.neighbors[0]!.stack = cubeHouse;
        center.neighbors[3]!.stack = ['YELLOW'];
        return { card, center };
    };

    it('refuses the phoenix cube on a one-level house', () => {
        const { card, center } = setup(['RED']);
        expect(card.canPlace(center)).toBeNull();
    });

    it('accepts the phoenix cube on a complete house', () => {
        const { card, center } = setup(['GRAY', 'RED']);
        expect(card.canPlace(center)?.cubeCell.id).toBe(center.neighbors[0]!.id);
    });
});

describe('stacking', () => {
    it('refuses any token on a cell with a cube', () => {
        const cell = generateBoard(5, 5)[0][0];
        expect(cell.canStack('BLUE')).toBe(true);
        cell.stack = ['BROWN'];
        cell.hasCube = true;
        const tokens: Token[] = ['GREEN', 'BROWN', 'RED', 'BLUE', 'YELLOW', 'GRAY'];
        for (const t of tokens) {
            expect(cell.canStack(t)).toBe(false);
        }
    });
});

describe('score breakdown', () => {
    it('totals the sum of its categories, with no spirit', () => {
        const grid = generateBoard(5, 5);
        grid[0][0].stack = ['BROWN', 'BROWN', 'GREEN'];
        grid[1][0].stack = ['YELLOW'];
        grid[0][1].stack = ['YELLOW'];
        grid[2][0].stack = ['GRAY', 'GRAY'];
        grid[2][1].stack = ['GRAY'];
        const card = { getScore: () => 9 };
        const s = computeScoreBreakdown(grid.flat(), [card], 'A');
        expect(s.spirit).toBe(0);
        expect(s.trees).toBe(7);
        expect(s.animals).toBe(9);
        expect(s.total).toBe(s.trees + s.mountains + s.fields + s.buildings + s.river + s.animals + s.spirit);
    });
});
