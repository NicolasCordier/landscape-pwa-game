import type { Cell } from './cell';

export type ZoneValidator = (cell: Cell) => boolean;

// Flood fill: groups cells matching the predicate into contiguous zones.
// Returns a double array where each inner array is one zone of direct Cell references.
export function computeZones(cells: Cell[], isValid: ZoneValidator): Cell[][] {
    const visited = new Set<string>();
    const zones: Cell[][] = [];

    function explore(cell: Cell, zoneIndex?: number): void {
        if (visited.has(cell.id)) {
            return;
        }
        visited.add(cell.id);
        if (!isValid(cell)) {
            return; // mark visited but do not recurse into this cell
        }
        const idx = zoneIndex ?? (zones.push([]) - 1);
        zones[idx].push(cell); // direct Cell reference
        for (const neighbor of cell.neighbors) {
            if (neighbor !== null) {
                explore(neighbor, idx);
            }
        }
    }

    for (const cell of cells) {
        explore(cell);
    }
    return zones;
}
