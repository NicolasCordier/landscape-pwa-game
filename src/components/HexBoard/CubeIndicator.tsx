import imgPaw from '../../assets/paw.svg';

interface CubeIndicatorProps {
    stackHeight: number;
    hexW:        number;
}

export function CubeIndicator({ stackHeight, hexW }: CubeIndicatorProps) {
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
            draggable={false}
            style={{
                gridRow:       1,
                gridColumn:    1,
                alignSelf:     'center',
                justifySelf:   'center',
                width:         D,
                marginTop,
                zIndex:        20,
                pointerEvents: 'none',
                userSelect:    'none',
            }}
        />
    );
}
