import type { Terrain } from './terrain';

export type Token = 'GREEN' | 'GRAY' | 'BROWN' | 'YELLOW' | 'BLUE' | 'RED';

export class Cell {
    id = crypto.randomUUID();
    neighbors: (Cell | null)[] = new Array(6).fill(null); // fixed 6-slot array, null = board edge
    stack: Token[] = [];
    hasCube = false;

    // Accessors for stack metadata (avoid raw stack access in business logic)
    top(): Token | undefined {
        return this.stack.at(-1);
    }

    height(): number {
        return this.stack.length;
    }

    detectTerrain(): Terrain | null {
        if (this.height() === 0) {
            return null;
        }
        if (this.top() === 'GREEN')  { return `TREE_${this.height()}` as Terrain; }
        if (this.top() === 'GRAY')   { return `MTN_${this.height()}` as Terrain; }
        if (this.top() === 'RED')    { return 'CITY'; }
        if (this.top() === 'YELLOW') { return 'FIELD'; }
        if (this.top() === 'BLUE')   { return 'RIVER'; }
        return null; // BROWN alone is not a finished terrain
    }

    canStack(token: Token): boolean {
        // Any token can be placed on an empty cell (official rule: always valid on empty)
        if (this.height() === 0) {
            return true;
        }
        // Non-empty stacking rules
        switch (token) {
            case 'GREEN':  return this.height() <= 2 && this.top() === 'BROWN';
            case 'GRAY':   return this.height() < 3 && this.top() === 'GRAY';
            case 'RED':    return this.height() < 2 && (this.top() === 'BROWN' || this.top() === 'GRAY' || this.top() === 'RED');
            case 'BROWN':  return this.height() < 2 && this.top() === 'BROWN';
            default:       return false; // YELLOW, BLUE only valid on empty (handled above)
        }
    }
}

export type BoardGrid = Cell[][];  // grid[col][row], double array for React display
