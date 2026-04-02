import type { Cell } from './cell';
import { simpleTerrainScoring } from './scoring';
import type { Terrain } from './terrain';
import { computeZones } from './zones';

// ─── Pattern types ────────────────────────────────────────────────────────────

export type PatternEntry = Terrain | null;

// Fixed 6-element tuple matching the 6 neighbor slots (index 0-5 clockwise)
export type Pattern = [
    Terrain, PatternEntry, PatternEntry,
    PatternEntry, PatternEntry, PatternEntry
];

// Index 0 is always non-null (Terrain), so cubeAt is either center or neighbor[0]
export type CubeAt = 'center' | '0';

// ─── Abstract base ────────────────────────────────────────────────────────────

export abstract class BaseCard {
    readonly id: string;
    readonly centerTerrain: Terrain;
    readonly pattern: Pattern;
    readonly cubeAt: CubeAt;
    readonly points: number[]; // descending, e.g. [15, 9, 4]
    cubeIndex: number;

    constructor(
        id: string,
        centerTerrain: Terrain,
        pattern: Pattern,
        cubeAt: CubeAt,
        points: number[]
    ) {
        this.id = id;
        this.centerTerrain = centerTerrain;
        this.pattern = pattern;
        this.cubeAt = cubeAt;
        this.points = points.sort((a, b) => b - a); // sort descending
        this.cubeIndex = points.length;
    }

    abstract getScore(): number;

    canPlaceMore(): boolean {
        return this.cubeIndex > 0;
    }

    // Returns valid cubeCell targets across all board cells (for UI highlighting)
    getValidPlacements(allCells: Cell[]): Cell[] {
        const seen = new Set<string>();
        const result: Cell[] = [];
        for (const cell of allCells) {
            const placement = this.canPlace(cell);
            if (placement !== null && !seen.has(placement.cubeCell.id)) {
                seen.add(placement.cubeCell.id);
                result.push(placement.cubeCell);
            }
        }
        return result;
    }

    // Checks if the card pattern matches at the given center cell across all 6 rotations.
    // Returns the matching rotation and the target cubeCell, or null if no match.
    canPlace(center: Cell): { rotation: number; cubeCell: Cell } | null {
        if (!this.canPlaceMore()) {
            return null;
        }
        if (center.detectTerrain() !== this.centerTerrain) {
            return null;
        }
        for (let rot = 0; rot < 6; rot++) {
            let ok = true;
            for (let i = 0; i < 6; i++) {
                const required = this.pattern[(i + rot) % 6];
                if (required === null) {
                    continue;
                }
                const neighbor = center.neighbors[i];
                if (!neighbor || neighbor.detectTerrain() !== required) {
                    ok = false;
                    break;
                }
            }
            if (!ok) {
                continue;
            }
            // cubeAt is always 'center' or '0', so neighbor index = rot (since (0+rot)%6 = rot)
        const cubeCell = this.cubeAt === 'center'
                ? center
                : center.neighbors[rot];
            if (cubeCell && !cubeCell.hasCube) {
                return { rotation: rot, cubeCell };
            }
        }
        return null;
    }

    // Decrements cubeIndex and marks the target cell as occupied
    place(cubeCell: Cell): void {
        this.cubeIndex--;
        cubeCell.hasCube = true;
    }
}

// ─── Animal card ──────────────────────────────────────────────────────────────

export class AnimalCard extends BaseCard {
    getScore(): number {
        // cubeIndex = points.length → no cube placed → points[length] = undefined → 0
        // cubeIndex = 0 → all cubes placed → points[0] = max score
        return this.points[this.cubeIndex] ?? 0;
    }
}

// ─── Spirit of Nature card ────────────────────────────────────────────────────

export class SpiritCard extends BaseCard {
    readonly scoreBonus: (cells: Cell[]) => number;

    constructor(
        id: string,
        centerTerrain: Terrain,
        pattern: Pattern,
        cubeAt: CubeAt,
        // End-of-game bonus scoring function (not serializable — looked up by id on load)
        scoreBonus: (cells: Cell[]) => number
    ) {
        super(id, centerTerrain, pattern, cubeAt, [0]); // 1 cube slot, no intermediate points
        this.scoreBonus = scoreBonus;
    }

    getScore(): number {
        return 0; // scored via scoreBonus at end of game, not tracked here
    }
}

// ─── Card registry ────────────────────────────────────────────────────────────

export const ALL_ANIMAL_CARDS = [
    new AnimalCard('crocodile',     'RIVER',    ['RIVER',  null,     null,    'TREE_3',   null,    null], '0',      [15, 9, 4]),
    new AnimalCard('ray',           'RIVER',    ['MTN_1',  null,     null,    'MTN_1',    null,    null], 'center', [16, 10, 4]),
    new AnimalCard('fish',          'RIVER',    ['MTN_3',  null,     null,     null,      null,    null], 'center', [16, 10, 6, 3]),
    new AnimalCard('otter',         'TREE_1',   ['RIVER',  null,     null,     'TREE_1',  null,    null], '0',      [16, 10, 5]),
    new AnimalCard('frog',          'RIVER',    ['TREE_1', null,     null,     null,      null,    null], 'center', [2, 4, 6, 10, 15]),
    new AnimalCard('duck',          'RIVER',    ['CITY',   null,     null,     null,      null,    null], 'center', [2, 4, 8, 13]),
    new AnimalCard('flamingo',      'RIVER',    ['FIELD',  'FIELD',  null,     null,      null,    null], 'center', [4, 10, 16]),
    new AnimalCard('gecko',         'FIELD',    ['CITY',   null,     null,     'FIELD',   null,    null], '0',      [5, 10, 16]),
    new AnimalCard('mouse',         'CITY',     ['FIELD',  null,     'FIELD',  null,      null,    null], 'center', [5, 10, 17]),
    new AnimalCard('peacock',       'CITY',     ['RIVER',  null,     'RIVER',  null,      null,    null], 'center', [5, 10, 17]),
    new AnimalCard('squirrel',      'CITY',     ['TREE_3', null,     null,     null,      null,    null], 'center', [4, 9, 15]),
    new AnimalCard('hedgehog',      'CITY',     ['TREE_2', 'TREE_2', null,     null,      null,    null], 'center', [5, 12]),
    new AnimalCard('bee',           'TREE_2',   ['FIELD',  'FIELD',  'FIELD',  null,      null,    null], 'center', [8, 18]),
    new AnimalCard('bear',          'TREE_1',   ['MTN_1',  'MTN_1',  null,     null,      null,    null], 'center', [5, 11]),
    new AnimalCard('rabbit',        'TREE_1',   ['TREE_1', null,     null,     'CITY',    null,    null], '0',      [5, 10, 17]),
    new AnimalCard('parrot',        'TREE_2',   ['RIVER',  'RIVER',  null,     null,      null,    null], 'center', [4, 9, 14]),
    new AnimalCard('boar',          'TREE_2',   ['CITY',   null,     null,     null,      null,    null], 'center', [4, 8, 13]),
    new AnimalCard('koala',         'TREE_2',   ['TREE_1', null,     null,     null,      null,    null], 'center', [3, 6, 10, 15]),
    new AnimalCard('wolf',          'TREE_3',   ['FIELD',  null,     null,     'FIELD',   null,    null], 'center', [4, 10, 16]),
    new AnimalCard('kingfisher',    'TREE_3',   ['RIVER',  null,     'RIVER',  null,      null,    null], 'center', [5, 11, 18]),
    new AnimalCard('penguin',       'MTN_1',    ['RIVER',  null,     'RIVER',  null,      null,    null], 'center', [4, 10, 16]),
    new AnimalCard('bat',           'MTN_1',    ['TREE_3', null,     null,     null,      null,    null], 'center', [3, 6, 10, 15]),
    new AnimalCard('fennec',        'MTN_1',    ['MTN_1',  null,     null,     'FIELD',   null,    null], '0',      [4, 9, 16]),
    new AnimalCard('macaque',       'MTN_2',    ['RIVER',  'RIVER',  null,     null,      null,    null], 'center', [5, 11]),
    new AnimalCard('condor',        'MTN_3',    ['FIELD',  null,     null,     null,      null,    null], 'center', [5, 11]),
    new AnimalCard('meerkat',       'MTN_1',    ['FIELD',  null,     null,     null,      null,    null], 'center', [2, 5, 9, 14]),
    new AnimalCard('raven',         'FIELD',    ['CITY',   null,     'CITY',   null,      null,    null], 'center', [4, 9]),
    new AnimalCard('llama',         'FIELD',    ['FIELD',  null,     null,     'MTN_2',   null,    null], '0',      [5, 12]),
    new AnimalCard('arctic_fox',    'FIELD',    ['TREE_2', null,     'TREE_2', null,      null,    null], 'center', [5, 10, 17]),
    new AnimalCard('raccoon',       'FIELD',    ['RIVER',  'RIVER',  'RIVER',  null,      null,    null], 'center', [6, 12]),
    new AnimalCard('ladybug',       'FIELD',    ['TREE_1', null,     null,     null,      null,    null], 'center', [2, 5, 8, 12, 17]),
    new AnimalCard('black_panther', 'TREE_2',   ['FIELD',  null,     null,     'TREE_2',  null,    null], '0',      [5, 11]),
];

export const ALL_SPIRIT_CARDS = [
    new SpiritCard('lion', 'FIELD', ['FIELD', null, null, 'TREE_2', null, null], 'center',
        (cells) => {
            const zones = computeZones(cells, c => c.detectTerrain() === 'FIELD');
            return zones.reduce((sum, z) => {
                if (z.length <= 2) {
                    return sum + 2;
                }
                return sum + 10;
            }, 0);
        }
    ),
    new SpiritCard('butterfly', 'RIVER', ['FIELD', 'RIVER', 'FIELD', null, null, null], '0',
        (cells) => {
            const zones = computeZones(cells, c => c.detectTerrain() === 'FIELD');
            return zones.length * 5;
        }
    ),
    new SpiritCard('deer', 'TREE_2', ['TREE_1', null, null, 'TREE_3', null, null], 'center',
        simpleTerrainScoring({ TREE_2: 4, TREE_3: 4 })
    ),
    new SpiritCard('owl', 'TREE_3', ['TREE_1', 'TREE_1', null, null, null, null], 'center',
        simpleTerrainScoring({ TREE_1: 3, TREE_2: 3, TREE_3: 1 })
    ),
    new SpiritCard('night_cat', 'TREE_1', ['CITY', null, null, 'CITY', null, null], '0',
        (cells) => {
            const zones = computeZones(cells, c => c.detectTerrain() === 'CITY');
            return zones.length * 4;
        }
    ),
    new SpiritCard('phoenix', 'CITY', ['CITY', null, null, 'FIELD', null, null], '0',
        (cells) => {
            const zones = computeZones(cells, c => c.detectTerrain() === 'CITY').filter((zones) => zones.length >= 2);
            return zones.length * 6;
        }
    ),
    new SpiritCard('ram', 'MTN_3', ['MTN_2', null, null, null, null, null], 'center',
        simpleTerrainScoring({ MTN_2: 4, MTN_3: 4 })
    ),
    new SpiritCard('marmot', 'MTN_2', ['MTN_1', null, 'MTN_1', null, null, null], 'center',
        simpleTerrainScoring({ MTN_1: 3, MTN_2: 3, TREE_3: 1 })
    ),
    new SpiritCard('dragonfly', 'RIVER', ['TREE_2', null, null, 'TREE_2', null, null], 'center',
        (cells) => {
            const zones = computeZones(cells, c => c.detectTerrain() === 'RIVER').filter((zones) => zones.length >= 2);
            return zones.length * 7;
        }
    ),
    new SpiritCard('turtle', 'RIVER', ['RIVER', null, null, 'MTN_2', null, null], 'center',
        simpleTerrainScoring({ RIVER: 2 })
    ),
];
