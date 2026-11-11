import type { Token } from '../../game/cell';
import { TOKEN_IMG } from './tokenImages';

interface TokenPickerProps {
    groups:   (Token[] | null)[]; // null = slot taken this turn
    disabled: boolean;            // a group was already taken this turn
    onTake:   (groupIdx: number) => void;
}

const IMG_STYLE: React.CSSProperties = {
    position:      'absolute',
    width:         '44%',
    pointerEvents: 'none',
    userSelect:    'none',
};

function MiniTriangle({ tokens }: { tokens: Token[] }) {
    return (
        <>
            <img src={TOKEN_IMG[tokens[0]]} alt={tokens[0]} draggable={false}
                 style={{ ...IMG_STYLE, top: '8%', left: '6%' }} />
            <img src={TOKEN_IMG[tokens[1]]} alt={tokens[1]} draggable={false}
                 style={{ ...IMG_STYLE, top: '8%', right: '6%' }} />
            <img src={TOKEN_IMG[tokens[2]]} alt={tokens[2]} draggable={false}
                 style={{ ...IMG_STYLE, bottom: '6%', left: '50%', transform: 'translateX(-50%)' }} />
        </>
    );
}

// Central offer: one circle per group of 3 tokens
export function TokenPicker({ groups, disabled, onTake }: TokenPickerProps) {
    return (
        <div className="token-picker">
            {groups.map((group, idx) => (
                <button
                    key={idx}
                    type="button"
                    className="token-group"
                    disabled={disabled || group === null}
                    onClick={() => onTake(idx)}
                    aria-label={group ? `Prendre le groupe ${idx + 1}` : 'Groupe pris'}
                >
                    {group && <MiniTriangle tokens={group} />}
                </button>
            ))}
        </div>
    );
}
