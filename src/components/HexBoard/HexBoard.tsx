import { useEffect, useRef, useState } from 'react';
import type { BoardGrid, Cell } from '../../game/cell';
import { SQRT3, GAP_H, GAP_V } from './constants';
import { HexColumn } from './HexColumn';

interface HexBoardProps {
    grid:              BoardGrid;
    onCellClick?:      (cell: Cell) => void;
    highlightedCells?: ReadonlySet<string>;
}

const PADDING = 6; // px around the board, keeps the drop-shadow visible

// Largest hex width that fits the available box, in width AND height
function fitHexWidth(width: number, height: number, nbCols: number, maxRows: number): number {
    // Board width  = hexW × (0.25 + 0.75 × nbCols) + (nbCols - 1) × GAP_H
    const fromWidth = (width - (nbCols - 1) * GAP_H) / (0.25 + 0.75 * nbCols);
    // Board height = maxRows × hexH + (maxRows - 1) × GAP_V, with hexH = hexW × √3 / 2
    const fromHeight = ((height - (maxRows - 1) * GAP_V) / maxRows) * 2 / SQRT3;
    return Math.max(10, Math.min(fromWidth, fromHeight));
}

export function HexBoard({ grid, onCellClick, highlightedCells }: HexBoardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hexW, setHexW] = useState(60);
    const nbCols = grid.length;
    const maxRows = Math.max(...grid.map(col => col.length));

    useEffect(() => {
        const el = containerRef.current;
        if (!el) {
            return;
        }
        const observer = new ResizeObserver(() => {
            setHexW(fitHexWidth(el.clientWidth - 2 * PADDING, el.clientHeight - 2 * PADDING, nbCols, maxRows));
        });
        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, [nbCols, maxRows]);

    const hexH = hexW * SQRT3 / 2;

    return (
        // Outer box fills its parent; the board is centered inside it
        <div
            ref={containerRef}
            style={{
                width:          '100%',
                height:         '100%',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                overflow:       'hidden',
            }}
        >
            <div style={{
                display:         'flex',
                alignItems:      'flex-start',
                backgroundColor: '#9e8761',
                borderRadius:    8,
                // filter lets the drop-shadow show through hex clip-paths
                filter:          'drop-shadow(1px 4px 2px rgba(0,0,0,0.4))',
            }}>
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
        </div>
    );
}
