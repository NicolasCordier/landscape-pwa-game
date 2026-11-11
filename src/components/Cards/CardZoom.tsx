import type { BaseCard } from '../../game/cards';
import { Card } from './Card';

interface CardZoomProps {
    card:        BaseCard;
    onClose:     () => void;
    actionLabel?: string;     // e.g. "Prendre cette carte"
    onAction?:   () => void;  // absent = no action available
    note?:       string;      // why the action is unavailable
}

// Full-size card in an overlay
export function CardZoom({ card, onClose, actionLabel, onAction, note }: CardZoomProps) {
    return (
        <div className="overlay" onClick={onClose}>
            <div className="card-zoom" onClick={e => e.stopPropagation()}>
                <div className="card-zoom-card">
                    <Card card={card} />
                </div>
                {note && <p className="card-zoom-note">{note}</p>}
                <div className="card-zoom-actions">
                    {onAction && actionLabel && (
                        <button type="button" className="primary" onClick={onAction}>{actionLabel}</button>
                    )}
                    <button type="button" onClick={onClose}>Fermer</button>
                </div>
            </div>
        </div>
    );
}
