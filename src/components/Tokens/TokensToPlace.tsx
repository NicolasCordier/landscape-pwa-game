import type { Token } from '../../game/cell';
import { TOKEN_IMG } from './tokenImages';

interface TokensToPlaceProps {
    tokens:        Token[];
    selectedIndex: number | null;
    onSelect:      (index: number) => void;
}

// Tokens of the taken group that still have to be placed
export function TokensToPlace({ tokens, selectedIndex, onSelect }: TokensToPlaceProps) {
    return (
        <div className="tokens-to-place">
            {tokens.map((token, idx) => (
                <button
                    key={idx}
                    type="button"
                    className={`token-button${idx === selectedIndex ? ' selected' : ''}`}
                    onClick={() => onSelect(idx)}
                    aria-label={`Jeton ${token}`}
                >
                    <img src={TOKEN_IMG[token]} alt={token} draggable={false} />
                </button>
            ))}
        </div>
    );
}
