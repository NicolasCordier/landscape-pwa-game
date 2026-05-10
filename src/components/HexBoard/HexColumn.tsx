import type { Cell } from '../../game/cell';
import { GAP_V, GAP_H } from './constants';
import { HexCell } from './HexCell';

export interface HexColumnProps {
    cells:             Cell[];
    colIdx:            number;
    hexW:              number;
    hexH:              number;
    highlightedCells?: ReadonlySet<string>;
    onCellClick?:      (cell: Cell) => void;
}

export function HexColumn({ cells, colIdx, hexW, hexH, highlightedCells, onCellClick }: HexColumnProps) {
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
