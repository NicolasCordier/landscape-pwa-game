import { useState } from 'react';
import { ALL_ANIMAL_CARDS, ALL_SPIRIT_CARDS } from '../../game/cards';
import type { BaseCard } from '../../game/cards';
import { Card } from './Card';
import { CardZoom } from './CardZoom';

interface CardsScreenProps {
    onBack: () => void;
}

const SECTIONS: { title: string; cards: BaseCard[] }[] = [
    { title: 'Animaux', cards: ALL_ANIMAL_CARDS },
    { title: 'Esprits', cards: ALL_SPIRIT_CARDS },
];

// Read-only catalog of every card; tap a card to see it in large
export function CardsScreen({ onBack }: CardsScreenProps) {
    const [zoomed, setZoomed] = useState<BaseCard | null>(null);

    return (
        <main className="cards-screen">
            <header className="cards-header">
                <button type="button" onClick={onBack}>Accueil</button>
                <h1>Cartes</h1>
            </header>

            {SECTIONS.map(section => (
                <section key={section.title} className="cards-section">
                    <h2>{section.title} ({section.cards.length})</h2>
                    <div className="cards-grid">
                        {section.cards.map(card => (
                            <Card key={card.id} card={card} onClick={setZoomed} />
                        ))}
                    </div>
                </section>
            ))}

            {zoomed && <CardZoom card={zoomed} onClose={() => setZoomed(null)} />}
        </main>
    );
}
