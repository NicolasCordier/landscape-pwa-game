import type { CubeAt, Pattern } from '../../game/cards';
import type { Token } from '../../game/cell';
import type { Terrain } from '../../game/terrain';
import { CubeIndicator } from '../HexBoard/CubeIndicator';
import { TokensWrapper } from '../HexBoard/TokensWrapper';
import { GAP_H, GAP_V, HEX_CLIP, SQRT3 } from '../HexBoard/constants';

// Canonical token stacks that produce each terrain when stacked
const TERRAIN_TOKENS: Record<Terrain, Token[]> = {
    TREE_1: ['GREEN'],
    TREE_2: ['BROWN', 'GREEN'],
    TREE_3: ['BROWN', 'BROWN', 'GREEN'],
    MTN_1:  ['GRAY'],
    MTN_2:  ['GRAY', 'GRAY'],
    MTN_3:  ['GRAY', 'GRAY', 'GRAY'],
    FIELD:  ['YELLOW'],
    CITY:   ['RED', 'RED'],
    RIVER:  ['BLUE'],
};

const HEX_W = 20;
const HEX_H = HEX_W * SQRT3 / 2;

interface MiniCellProps {
    terrain: Terrain | null;
    hasCube: boolean;
}

// Hex cell that shows soil + tokens only if terrain is present; invisible otherwise.
function MiniHexCell({ terrain, hasCube }: MiniCellProps) {
    const tokens  = terrain !== null ? TERRAIN_TOKENS[terrain] : [];
    const visible = terrain !== null;

    return (
        <div style={{
            width:           HEX_W,
            height:          HEX_H,
            flexShrink:      0,
            clipPath:        visible ? HEX_CLIP : undefined,
            backgroundColor: visible ? (hasCube ? '#f5e97a' : '#e8dfc8') : 'transparent',
            overflow:        'clip',
            display:         'grid',
            alignItems:      'center',
            justifyContent:  'center',
        }}>
            {hasCube && <CubeIndicator stackHeight={tokens.length} hexW={HEX_W} />}
            <TokensWrapper stack={tokens} hexW={HEX_W} />
        </div>
    );
}

interface PatternPreviewProps {
    centerTerrain: Terrain;
    pattern:       Pattern;
    cubeAt:        CubeAt;
}

// Mini 3-column board (same geometry as HexBoard).
// Center at col=1 (odd), row=1. Neighbors around with index 0 to the down right
export function PatternPreview({ centerTerrain, pattern, cubeAt }: PatternPreviewProps) {
    const cols: MiniCellProps[][] = [
        [
            { terrain: null, hasCube: false },
            { terrain: pattern[3], hasCube: false },
            { terrain: pattern[2], hasCube: false },
        ],
        [
            { terrain: pattern[4], hasCube: false },
            { terrain: centerTerrain, hasCube: cubeAt === 'center'  },
            { terrain: pattern[1], hasCube: false },
        ],
        [
            { terrain: null, hasCube: false },
            { terrain: pattern[5], hasCube: false },
            { terrain: pattern[0], hasCube: cubeAt === '0' },
        ],
    ];

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
            {cols.map((col, colIdx) => (
                <div
                    key={colIdx}
                    style={{
                        display:       'flex',
                        flexDirection: 'column',
                        flexShrink:    0,
                        gap:           GAP_V,
                        marginTop:     colIdx % 2 === 1 ? HEX_H / 2 : 0,
                        marginLeft:    colIdx === 0 ? 0 : -(HEX_W / 4) + GAP_H,
                    }}
                >
                    {col.map((cell, i) => (
                        <MiniHexCell key={i} terrain={cell.terrain} hasCube={cell.hasCube} />
                    ))}
                </div>
            ))}
        </div>
    );
}
