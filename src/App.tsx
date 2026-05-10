import { useMemo, useState } from 'react';
import PWABadge from './PWABadge.tsx';
import { HexBoard } from './components/HexBoard/HexBoard.tsx';
import { generateBoardType } from './game/board.ts';
import type { Cell } from './game/cell.ts';

function App() {
    const grid = useMemo(() => {
        const g = generateBoardType('A');
        // Seed a few cells with tokens for visual testing
        g[2][2].stack.push('BROWN', 'GREEN');
        g[2][1].stack.push('GRAY', 'GRAY');
        g[1][1].stack.push('YELLOW');
        g[3][2].stack.push('BLUE');
        g[0][0].stack.push('BROWN', 'RED');
        g[4][3].stack.push('GRAY', 'GRAY', 'GRAY');
        g[2][2].hasCube = true;
        g[3][2].hasCube = true;
        g[4][3].hasCube = true;
        return g;
    }, []);

    const [highlighted, setHighlighted] = useState<ReadonlySet<string>>(new Set());

    function handleCellClick(cell: Cell) {
        setHighlighted(prev => {
            const next = new Set(prev);
            if (next.has(cell.id)) {
                next.delete(cell.id);
            } else {
                next.add(cell.id);
            }
            return next;
        });
    }

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: 16 }}>
            <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Landscape</h1>
            <HexBoard
                grid={grid}
                onCellClick={handleCellClick}
                highlightedCells={highlighted}
            />
            <PWABadge />
        </div>
    );
}

export default App;
