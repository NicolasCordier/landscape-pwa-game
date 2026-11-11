import type { BaseCard } from '../../game/cards';
import { CompactCard } from './CompactCard';

interface PlayerHandProps {
    cards:       BaseCard[];
    maxCards:    number;
    selectedId?: string;
    onSelect:    (card: BaseCard) => void;
    onZoom:      (card: BaseCard) => void;
}

// Unfinished cards in hand; selecting one shows where its cubes can go
export function PlayerHand({ cards, maxCards, selectedId, onSelect, onZoom }: PlayerHandProps) {
    const emptySlots = Math.max(0, maxCards - cards.length);
    return (
        <div className="card-row">
            {cards.map(card => (
                <CompactCard
                    key={card.id}
                    card={card}
                    selected={card.id === selectedId}
                    onClick={() => onSelect(card)}
                    onZoom={() => onZoom(card)}
                />
            ))}
            {Array.from({ length: emptySlots }, (_, i) => (
                <div key={`empty-${i}`} className="compact-card empty" aria-hidden />
            ))}
        </div>
    );
}
