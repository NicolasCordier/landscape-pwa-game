import { useEffect, useRef, useState } from 'react';
import type { BoardGrid, Cell } from '../../game/cell';
import { SQRT3, GAP_H } from './constants';
import { HexColumn } from './HexColumn';

interface HexBoardProps {
    grid:              BoardGrid;
    onCellClick?:      (cell: Cell) => void;
    highlightedCells?: ReadonlySet<string>;
}

export function HexBoard({ grid, onCellClick, highlightedCells }: HexBoardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hexW, setHexW] = useState(120);
    const nbCols = grid.length;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) {
            return;
        }
        const observer = new ResizeObserver(() => {
            // Total grid width = hexW × (0.25 + 0.75 × nbCols)
            // plus (nbCols-1) × GAP_H for column gaps
            // Solve for hexW (approx, gap correction is small):
            setHexW((el.offsetWidth - (nbCols - 1) * GAP_H) / (0.25 + 0.75 * nbCols));
        });
        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, [nbCols]);

    const hexH = hexW * SQRT3 / 2;

    return (
        <div
            ref={containerRef}
            style={{
                display:         'flex',
                alignItems:      'flex-start',
                backgroundColor: '#9e8761',
                borderRadius:    8,
                // filter lets the drop-shadow show through hex clip-paths
                filter:          'drop-shadow(1px 4px 2px rgba(0,0,0,0.4))',
            }}
        >
            {grid.map((colCells, colIdx) => (
                <HexColumn
                    key={colIdx}
                    cells={colCells}
                    colIdx={colIdx}
                    hexW={hexW}
                    hexH={hexH}
                    highlightedCells={highlightedCells}
                    onCellClick={onCellClick}
                />
            ))}
        </div>
    );
}
