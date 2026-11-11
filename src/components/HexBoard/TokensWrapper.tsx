import type { Token } from '../../game/cell';
import { TOKEN_IMG } from '../Tokens/tokenImages';

interface TokensWrapperProps {
    stack: Token[];
    hexW:  number;
}

export function TokensWrapper({ stack, hexW }: TokensWrapperProps) {
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
                    draggable={false}
                    style={{
                        gridRow:       1,
                        gridColumn:    1,
                        width:         D,
                        marginTop:     margins[idx],
                        zIndex:        idx + 1,
                        pointerEvents: 'none',
                        userSelect:    'none',
                    }}
                />
            ))}
        </div>
    );
}
