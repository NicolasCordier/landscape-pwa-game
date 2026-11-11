import type { BaseCard } from '../../game/cards';
import { CompactCard } from './CompactCard';

interface SelectableCardsProps {
    cards:  BaseCard[];
    onOpen: (card: BaseCard) => void; // opens the card in large, where it can be taken
}

// Face-up animal cards that can be taken
export function SelectableCards({ cards, onOpen }: SelectableCardsProps) {
    return (
        <div className="card-row">
            {cards.map(card => (
                <CompactCard key={card.id} card={card} onClick={() => onOpen(card)} />
            ))}
        </div>
    );
}
