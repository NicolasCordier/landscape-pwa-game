import type { BaseCard } from '../../game/cards';
import { Card } from './Card';

interface SelectableCardsProps {
    cards:       BaseCard[];
    selectedId?: string;
    onSelect?:   (card: BaseCard) => void;
}

export function SelectableCards({ cards, selectedId, onSelect }: SelectableCardsProps) {
    return (
        <div style={{
            flex:           1,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'flex-end',
            gap:            8,
            padding:        '0 4px',
        }}>
            {cards.map(card => (
                <Card
                    key={card.id}
                    card={card}
                    selected={card.id === selectedId}
                    onClick={onSelect}
                />
            ))}
        </div>
    );
}
