import type { BaseCard } from '../../game/cards';
import { CompactCard } from './CompactCard';

interface SelectableCardsProps {
    cards:  (BaseCard | null)[];      // null = slot emptied this turn, refilled next turn
    onOpen: (card: BaseCard) => void; // opens the card in large, where it can be taken
}

// Face-up animal cards that can be taken or discarded
export function SelectableCards({ cards, onOpen }: SelectableCardsProps) {
    return (
        <div className="card-row">
            {cards.map((card, idx) => card === null
                ? <div key={`empty-${idx}`} className="compact-card empty" aria-label="Emplacement vide" />
                : <CompactCard key={card.id} card={card} onClick={() => onOpen(card)} />
            )}
        </div>
    );
}
