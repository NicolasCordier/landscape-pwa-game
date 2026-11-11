import type { BaseCard } from '../../game/cards';
import { TERRAIN_COLOR } from './colors';
import { formatCardName } from './cardName';
import { PatternPreview } from './PatternPreview';

interface CompactCardProps {
    card:      BaseCard;
    selected?: boolean;
    disabled?: boolean;
    onClick?:  () => void;
    onZoom?:   () => void;
}

// Small card: name, pattern and point steps. Earned steps are filled.
export function CompactCard({ card, selected, disabled, onClick, onZoom }: CompactCardProps) {
    const color = TERRAIN_COLOR[card.centerTerrain];
    const ascending = [...card.points].reverse();
    const placed = card.points.length - card.cubeIndex;

    return (
        <div
            className={`compact-card${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
            style={{ borderTopColor: color }}
            onClick={disabled ? undefined : onClick}
            role="button"
            aria-pressed={selected}
            aria-label={formatCardName(card.id)}
        >
            <span className="compact-card-name">{formatCardName(card.id)}</span>
            <PatternPreview centerTerrain={card.centerTerrain} pattern={card.pattern} cubeAt={card.cubeAt} />
            <div className="compact-card-points">
                {ascending.map((p, i) => (
                    <span
                        key={i}
                        className="compact-card-point"
                        style={i < placed
                            ? { backgroundColor: color, color: '#fff', borderColor: color }
                            : { borderColor: color, color }}
                    >
                        {p}
                    </span>
                ))}
            </div>
            {onZoom && (
                <button
                    type="button"
                    className="compact-card-zoom"
                    aria-label="Agrandir la carte"
                    onClick={e => { e.stopPropagation(); onZoom(); }}
                >
                    +
                </button>
            )}
        </div>
    );
}
