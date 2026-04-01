import type { Cell } from './cell';
import type { Terrain } from './terrain';
import { computeZones } from './zones';

// ─── Trees ────────────────────────────────────────────────────────────────────

export function scoreTrees(cells: Cell[]): number {
    const pts: Partial<Record<Terrain, number>> = { TREE_1: 1, TREE_2: 3, TREE_3: 7 };
    return cells.reduce((sum, cell) => {
        const terrain = cell.detectTerrain();
        return sum + (terrain !== null ? (pts[terrain] ?? 0) : 0);
    }, 0);
}

// ─── Mountains ────────────────────────────────────────────────────────────────

export function scoreMountains(cells: Cell[]): number {
    const pts: Partial<Record<Terrain, number>> = { MTN_1: 1, MTN_2: 3, MTN_3: 7 };
    return cells.reduce((sum, cell) => {
        const terrain = cell.detectTerrain();
        if (terrain === null || pts[terrain] === undefined) {
            return sum;
        }
        const hasAdjacentMountain = cell.neighbors.some(
            n => n !== null && n.detectTerrain()?.startsWith('MTN')
        );
        return sum + (hasAdjacentMountain ? pts[terrain]! : 0);
    }, 0);
}

// ─── Fields ───────────────────────────────────────────────────────────────────

export function scoreFields(cells: Cell[]): number {
    const zones = computeZones(cells, c => c.detectTerrain() === 'FIELD');
    return zones.filter(z => z.length >= 2).length * 5;
}

// ─── Buildings ────────────────────────────────────────────────────────────────

export function scoreBuildings(cells: Cell[]): number {
    return cells.reduce((sum, cell) => {
        if (cell.detectTerrain() !== 'CITY') {
            return sum;
        }
        // Count distinct top-token colors among non-empty neighbors (empty cells ignored)
        const colors = new Set(
            cell.neighbors
                .filter((n): n is Cell => n !== null && n.height() > 0)
                .map(n => n.top())
        );
        return sum + (colors.size >= 3 ? 5 : 0);
    }, 0);
}

// ─── River Face A — BFS shortest path ─────────────────────────────────────────

export function scoreRiverFaceA(cells: Cell[]): number {
    const riverCells = cells.filter(c => c.detectTerrain() === 'RIVER');
    if (riverCells.length === 0) {
        return 0;
    }

    // Split into connected river components; score only the best one
    const components = computeZones(riverCells, c => c.detectTerrain() === 'RIVER');

    let bestScore = 0;

    for (const component of components) {
        const componentSet = new Set(component.map(c => c.id));

        // Endpoints: cells with at most 1 river neighbor within this component
        const endpoints = component.filter(c =>
            c.neighbors.filter(n => n !== null && componentSet.has(n.id)).length <= 1
        );

        const starts = endpoints.length > 0 ? endpoints : [component[0]];
        let componentBest = 0;

        for (const start of starts) {
            // BFS to measure shortest distance from start to all other cells in component
            const dist = new Map<string, number>();
            dist.set(start.id, 1);
            const queue: Cell[] = [start];
            while (queue.length > 0) {
                const curr = queue.shift()!;
                for (const n of curr.neighbors) {
                    if (n !== null && componentSet.has(n.id) && !dist.has(n.id)) {
                        dist.set(n.id, dist.get(curr.id)! + 1);
                        queue.push(n);
                    }
                }
            }
            // Measure shortest path distance to each other endpoint
            for (const end of endpoints) {
                if (end.id !== start.id) {
                    const d = dist.get(end.id) ?? 0;
                    if (d > componentBest) {
                        componentBest = d;
                    }
                }
            }
        }

        // If no endpoints (closed loop), use total component size
        if (endpoints.length === 0) {
            componentBest = component.length;
        }

        const componentScore = componentBest + Math.max(0, componentBest - 6) * 4;
        if (componentScore > bestScore) {
            bestScore = componentScore;
        }
    }

    return bestScore;
}

// ─── Islands Face B ───────────────────────────────────────────────────────────

// Each group of cells isolated by RIVER tiles = 1 island, worth 5 pts
export function scoreRiverFaceB(cells: Cell[]): number {
    const islands = computeZones(cells, c => c.detectTerrain() !== 'RIVER');
    return islands.length * 5;
}

// ─── Animals ──────────────────────────────────────────────────────────────────

// Import type only to avoid circular dep — caller passes already-typed cards
export function scoreAnimals(cards: { getScore(): number }[]): number {
    return cards.reduce((sum, card) => sum + card.getScore(), 0);
}

// ─── Final score ──────────────────────────────────────────────────────────────

export function computeFinalScore(
    cells: Cell[],
    cards: { getScore(): number }[],
    face: 'A' | 'B',
    spiritBonusFn?: (cells: Cell[]) => number
): number {
    const riverScore = face === 'A' ? scoreRiverFaceA(cells) : scoreRiverFaceB(cells);
    const spiritBonus = spiritBonusFn ? spiritBonusFn(cells) : 0;

    return (
        scoreTrees(cells) +
        scoreMountains(cells) +
        scoreFields(cells) +
        scoreBuildings(cells) +
        riverScore +
        scoreAnimals(cards) +
        spiritBonus
    );
}
