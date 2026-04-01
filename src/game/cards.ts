import type { Cell } from './cell';
import type { Terrain } from './terrain';
import { computeZones } from './zones';

// ─── Pattern types ────────────────────────────────────────────────────────────

export type PatternEntry = Terrain | null;

// Fixed 6-element tuple matching the 6 neighbor slots (index 0-5 clockwise)
export type Pattern = [
    PatternEntry, PatternEntry, PatternEntry,
    PatternEntry, PatternEntry, PatternEntry
];

// Extracts numeric indices of non-null pattern entries for compile-time cubeAt validation
type NonNullIndex<P extends Pattern> = {
    [K in keyof P & `${number}`]: P[K] extends null ? never : K
}[keyof P & `${number}`];

export type CubeAt<P extends Pattern> = 'center' | NonNullIndex<P>;

// ─── Abstract base ────────────────────────────────────────────────────────────

export abstract class BaseCard<P extends Pattern = Pattern> {
    readonly id: string;
    readonly centerTerrain: Terrain;
    readonly pattern: P;
    readonly cubeAt: CubeAt<P>;
    readonly points: number[]; // descending, e.g. [15, 9, 4]
    cubeIndex: number;

    constructor(
        id: string,
        centerTerrain: Terrain,
        pattern: P,
        cubeAt: CubeAt<P>,
        points: number[]
    ) {
        this.id = id;
        this.centerTerrain = centerTerrain;
        this.pattern = pattern;
        this.cubeAt = cubeAt;
        this.points = points;
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
            const cubeCell = this.cubeAt === 'center'
                ? center
                : center.neighbors[(+this.cubeAt + rot) % 6];
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

export class AnimalCard<P extends Pattern = Pattern> extends BaseCard<P> {
    getScore(): number {
        // cubeIndex = points.length → no cube placed → points[length] = undefined → 0
        // cubeIndex = 0 → all cubes placed → points[0] = max score
        return this.points[this.cubeIndex] ?? 0;
    }
}

// ─── Spirit of Nature card ────────────────────────────────────────────────────

export class SpiritCard extends BaseCard<Pattern> {
    readonly scoreBonus: (cells: Cell[]) => number;

    constructor(
        id: string,
        centerTerrain: Terrain,
        pattern: Pattern,
        cubeAt: CubeAt<Pattern>,
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

// TODO: fill in all 32 animal cards with their exact data from the physical game.
// Pattern indices 0-5 are clockwise neighbors starting top-right.
// points[] is descending: [max_score, ..., min_score], length = number of cube slots.
// Patterns are cast to Pattern to fix generic invariance when storing in typed arrays.
export const ALL_CARDS: AnimalCard<Pattern>[] = [
    // Example: deer — FIELD center, TREE_2 at neighbor 1, FIELD at neighbor 3; cube at center
    new AnimalCard('deer',  'FIELD',  [null, 'TREE_2', null, 'FIELD', null, null] as Pattern, 'center', [9, 4]),
    // Example: bear — TREE_3 center; cube at center
    new AnimalCard('bear',  'TREE_3', [null, null, null, null, null, null] as Pattern,         'center', [15, 9, 4]),
    // Example: eagle — MTN_2 center; cube at center
    new AnimalCard('eagle', 'MTN_2',  [null, null, null, null, null, null] as Pattern,         'center', [9, 4]),
];

// TODO: fill in all 10 spirit cards with their exact data and scoreBonus functions.
export const ALL_SPIRIT_CARDS: SpiritCard[] = [
    // Example spirit: 2pts per small yellow group (1-2), 10pts per large group (3+)
    new SpiritCard(
        'spirit_meadow',
        'FIELD',
        [null, null, null, null, null, null] as Pattern,
        'center',
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
];
