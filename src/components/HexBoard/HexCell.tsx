import type { Cell } from '../../game/cell';
import { HEX_CLIP } from './constants';
import { CubeIndicator } from './CubeIndicator';
import { TokensWrapper } from './TokensWrapper';

export interface HexCellProps {
    cell:        Cell;
    hexW:        number;
    hexH:        number;
    highlighted: boolean;
    onClick?:    (cell: Cell) => void;
}

export function HexCell({ cell, hexW, hexH, highlighted, onClick }: HexCellProps) {
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
