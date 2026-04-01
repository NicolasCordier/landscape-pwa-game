import { Cell } from './cell';
import type { BoardGrid } from './cell';

export function generateBoardType(face: 'A' | 'B'): BoardGrid {
    return face === 'A' ? generateBoard(5, 5) : generateBoard(7, 4);
}

// nbColumns = total column count
// nbLines   = row count for even-index columns (odd-index columns get nbLines - 1)
export function generateBoard(nbColumns: number, nbLines: number): BoardGrid {
    const grid: BoardGrid = [];
    for (let col = 0; col < nbColumns; col++) {
        const rows = col % 2 === 0 ? nbLines : nbLines - 1;
        grid.push(Array.from({ length: rows }, () => new Cell()));
    }
    linkNeighbors(grid);
    return grid;
}

function linkNeighbors(grid: BoardGrid): void {
    for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
            const cell = grid[col][row];
            // Neighbor offsets indexed 0-5 clockwise, split by column parity
            const offsets = col % 2 === 0
                ? [[col + 1, row - 1], [col + 1, row], [col, row + 1], [col - 1, row], [col - 1, row - 1], [col, row - 1]]
                : [[col + 1, row], [col + 1, row + 1], [col, row + 1], [col - 1, row + 1], [col - 1, row], [col, row - 1]];
            offsets.forEach(([c, r], i) => {
                const exists = c >= 0 && c < grid.length && r >= 0 && r < (grid[c]?.length ?? 0);
                cell.neighbors[i] = exists ? grid[c][r] : null; // null = board edge
            });
        }
    }
}
