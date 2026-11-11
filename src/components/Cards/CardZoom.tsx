import type { BaseCard } from '../../game/cards';
import { Card } from './Card';

export interface CardZoomAction {
    label:    string;
    onClick:  () => void;
    primary?: boolean;
}

interface CardZoomProps {
    card:     BaseCard;
    onClose:  () => void;
    actions?: CardZoomAction[]; // e.g. take or discard the card
    note?:    string;           // why an action is unavailable
}

// Full-size card in an overlay
export function CardZoom({ card, onClose, actions = [], note }: CardZoomProps) {
    return (
        <div className="overlay" onClick={onClose}>
            <div className="card-zoom" onClick={e => e.stopPropagation()}>
                <div className="card-zoom-card">
                    <Card card={card} />
                </div>
                {note && <p className="card-zoom-note">{note}</p>}
                <div className="card-zoom-actions">
                    {actions.map(action => (
                        <button
                            key={action.label}
                            type="button"
                            className={action.primary ? 'primary' : undefined}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </button>
                    ))}
                    <button type="button" onClick={onClose}>Fermer</button>
                </div>
            </div>
        </div>
    );
}
