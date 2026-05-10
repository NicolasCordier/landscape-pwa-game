import { useEffect, useRef, useState } from 'react';
import type { BoardGrid, Cell, Token } from '../../game/cell';

import imgPaw    from '../../assets/paw.svg';
import imgBlue   from '../../assets/tokens/blue.png';
import imgYellow from '../../assets/tokens/yellow.png';
import imgGreen  from '../../assets/tokens/green.png';
import imgBrown  from '../../assets/tokens/brown.png';
import imgGrey   from '../../assets/tokens/grey.png';
import imgRed    from '../../assets/tokens/red.png';

const TOKEN_IMG: Record<Token, string> = {
    BLUE:   imgBlue,
    YELLOW: imgYellow,
    GREEN:  imgGreen,
    BROWN:  imgBrown,
    GRAY:   imgGrey,
    RED:    imgRed,
};

const HEX_CLIP = 'polygon(75% 0,100% 50%,75% 100%,25% 100%,0 50%,25% 0)';
const SQRT3    = Math.sqrt(3);
// Small gap between hexes, same ratio as reference (.1em / .1866em ≈ 0.536)
const GAP_V    = 2;  // px, vertical gap between hexes in same column
const GAP_H    = 3;  // px, gap between adjacent columns (added to overlap)

// ─── Types ────────────────────────────────────────────────────────────────────

interface HexBoardProps {
    grid:              BoardGrid;
    onCellClick?:      (cell: Cell) => void;
    highlightedCells?: ReadonlySet<string>;
}

// ─── Board ────────────────────────────────────────────────────────────────────

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

// ─── Column ───────────────────────────────────────────────────────────────────

interface HexColumnProps {
    cells:            Cell[];
    colIdx:           number;
    hexW:             number;
    hexH:             number;
    highlightedCells?: ReadonlySet<string>;
    onCellClick?:     (cell: Cell) => void;
}

function HexColumn({ cells, colIdx, hexW, hexH, highlightedCells, onCellClick }: HexColumnProps) {
    const isOdd = colIdx % 2 === 1;

    return (
        <div style={{
            display:       'flex',
            flexDirection: 'column',
            flexShrink:    0,
            gap:           GAP_V,
            // Odd columns: shift down by half a hex height to interlock
            marginTop:     isOdd ? hexH / 2 : 0,
            // All columns except the first overlap by hexW/4, minus a small gap
            marginLeft:    colIdx === 0 ? 0 : -(hexW / 4) + GAP_H,
        }}>
            {cells.map(cell => (
                <HexCell
                    key={cell.id}
                    cell={cell}
                    hexW={hexW}
                    hexH={hexH}
                    highlighted={highlightedCells?.has(cell.id) ?? false}
                    onClick={onCellClick}
                />
            ))}
        </div>
    );
}

// ─── Hex cell ─────────────────────────────────────────────────────────────────

interface HexCellProps {
    cell:        Cell;
    hexW:        number;
    hexH:        number;
    highlighted: boolean;
    onClick?:    (cell: Cell) => void;
}

function HexCell({ cell, hexW, hexH, highlighted, onClick }: HexCellProps) {
    return (
        <div
            onClick={() => onClick?.(cell)}
            style={{
                width:           hexW,
                height:          hexH,
                clipPath:        HEX_CLIP,
                backgroundColor: highlighted ? '#d0ef79' : '#e8dfc8',
                cursor:          onClick ? 'pointer' : 'default',
                overflow:        'clip',
                flexShrink:      0,
                // Inner grid: cube and tokens share cell (1,1)
                display:         'grid',
                alignItems:      'center',
                justifyContent:  'center',
            }}
        >
            {cell.hasCube && (
                <CubeIndicator stackHeight={cell.stack.length} hexW={hexW} />
            )}
            <TokensWrapper stack={cell.stack} hexW={hexW} />
        </div>
    );
}

// ─── Cube indicator ───────────────────────────────────────────────────────────

interface CubeIndicatorProps {
    stackHeight: number;
    hexW:        number;
}

function CubeIndicator({ stackHeight, hexW }: CubeIndicatorProps) {
    const D = hexW * 0.25;

    // margin-top per stack height: cube sits above the top token.
    // Same pattern as TokensWrapper — negative = shift up from center.
    const MARGINS: Record<number, number> = {
        1: -D * 0.90,
        2: -D * 1.55,
        3: -D * 2.20,
    };
    const marginTop = MARGINS[stackHeight];

    return (
        <img
            src={imgPaw}
            alt="paw"
            style={{
                gridRow:       1,
                gridColumn:    1,
                alignSelf:     'center',
                justifySelf:   'center',
                width:         D,
                marginTop,
                zIndex:        20,
                pointerEvents: 'none',
                userSelect: 'none',
            }}
        />
    );
}

// ─── Tokens wrapper ───────────────────────────────────────────────────────────

interface TokensWrapperProps {
    stack: Token[];
    hexW:  number;
}

function TokensWrapper({ stack, hexW }: TokensWrapperProps) {
    if (stack.length === 0) {
        return null;
    }

    const D = hexW * 0.50; // token image width in px
    const n = stack.length;

    // margin-top for each token level (index 0 = bottom of stack), in px.
    const MARGINS: Record<number, number[]> = {
        1: [0],
        2: [D * 0.33, -D * 0.33],
        3: [D * 0.66, 0, -D * 0.69],
    };
    const margins = MARGINS[n];

    return (
        <div style={{
            gridRow:       1,
            gridColumn:    1,
            display:       'grid',
            placeItems:    'center',
            pointerEvents: 'none',
        }}>
            {stack.map((token, idx) => (
                <img
                    key={idx}
                    src={TOKEN_IMG[token]}
                    alt={token}
                    style={{
                        gridRow:       1,
                        gridColumn:    1,
                        width:         D,
                        marginTop:     margins[idx],
                        zIndex:        idx + 1,
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                />
            ))}
        </div>
    );
}
